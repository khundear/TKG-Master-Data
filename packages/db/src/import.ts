// pnpm db:import — load the two source workbooks into the database as DRAFT records.
//
// Reads $TKG_DATA_DIR (default: <repo>/Data) and replaces the previous draft snapshot of each domain.
// It refuses to run if any record of that domain is no longer draft, so it can never overwrite approved data.
// Every record keeps its import batch, sheet and row; every source row is kept as raw JSON in import_rows.
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { PrismaClient, Prisma } from '@prisma/client';
import {
  MAPPING_VERSION,
  MATERIAL_FILE,
  SKU_FILE,
  parseUnit,
  readMaterialWorkbook,
  readSkuWorkbook,
  type RawSheetRow,
} from './mapping';
import { seed } from './seed';

type Tx = Prisma.TransactionClient;
const TX = { timeout: 300_000, maxWait: 30_000 };
const CHUNK = 1000;

export function dataDir(): string {
  if (process.env.TKG_DATA_DIR) return resolve(process.env.TKG_DATA_DIR);
  return resolve(dirname(fileURLToPath(import.meta.url)), '../../../Data');
}

async function inChunks<T>(items: T[], fn: (chunk: T[]) => Promise<unknown>): Promise<void> {
  for (let i = 0; i < items.length; i += CHUNK) await fn(items.slice(i, i + CHUNK));
}

async function startBatch(db: PrismaClient, file: string) {
  const hash = createHash('sha256').update(readFileSync(file)).digest('hex');
  return db.importBatch.create({
    data: { sourceFile: file.split('/').pop()!, sourceHash: hash, mappingVersion: MAPPING_VERSION },
  });
}

/** Marks the batch completed with its summary, or failed with the error, and passes the result through. */
async function finishBatch<T extends Prisma.InputJsonObject>(db: PrismaClient, id: string, work: Promise<T>): Promise<T> {
  try {
    const summary = await work;
    await db.importBatch.update({ where: { id }, data: { status: 'completed', finishedAt: new Date(), summary } });
    return summary;
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await db.importBatch.update({ where: { id }, data: { status: 'failed', finishedAt: new Date(), summary: { error } } });
    throw e;
  }
}

async function saveRawRows(tx: Tx, batchId: string, raw: RawSheetRow[]) {
  await inChunks(raw, (c) =>
    tx.importRow.createMany({ data: c.map((r) => ({ batchId, sheet: r.sheet, rowNo: r.row, raw: r.raw })) }),
  );
}

async function refuseIfNotDraft(counts: Record<string, number>) {
  const blocked = Object.entries(counts).filter(([, n]) => n > 0);
  if (blocked.length) {
    throw new Error(
      `Import stopped: ${blocked.map(([t, n]) => `${n} ${t}`).join(', ')} are no longer draft. ` +
        'The importer only replaces draft data; approved data needs the review workflow (not built yet).',
    );
  }
}

async function brandIds(tx: Tx): Promise<Map<string, string>> {
  return new Map((await tx.brand.findMany()).map((b) => [b.code, b.id]));
}

// ---------------------------------------------------------------- materials

export async function importMaterials(db: PrismaClient, file: string) {
  const wbk = readMaterialWorkbook(file);
  const notDraft = { status: { not: 'draft' as const } };
  await refuseIfNotDraft({
    materials: await db.material.count({ where: notDraft }),
    'material categories': await db.materialCategory.count({ where: notDraft }),
    'brand usages': await db.materialBrandUsage.count({ where: notDraft }),
    units: await db.unit.count({ where: notDraft }),
  });

  const batch = await startBatch(db, file);
  const summary = await finishBatch(db, batch.id, db.$transaction(async (tx) => {
    await tx.materialBrandUsage.deleteMany({});
    await tx.material.deleteMany({});
    await tx.materialCategory.deleteMany({});
    await tx.unit.deleteMany({});
    await saveRawRows(tx, batch.id, wbk.raw);
    const brands = await brandIds(tx);

    // category tree — ids made here so children can point at parents in the same insert
    const catId = new Map(wbk.categories.map((c) => [c.code, randomUUID()]));
    await tx.materialCategory.createMany({
      data: wbk.categories.map((c) => ({
        id: catId.get(c.code)!,
        code: c.code,
        level: c.level,
        group: c.group,
        primaryCode: c.primaryCode,
        secondaryCode: c.secondaryCode,
        tertiaryCode: c.tertiaryCode,
        nameTh: c.nameTh,
        parentId: c.parentCode ? (catId.get(c.parentCode) ?? null) : null,
        sortOrder: c.sortOrder,
        sheetClassified: c.sheetClassified,
        sheetPending: c.sheetPending,
        importBatchId: batch.id,
        sourceSheet: c.source.sheet,
        sourceRow: c.source.row,
      })),
    });

    // units, as written on materials
    const unitId = new Map<string, string>();
    const units: Prisma.UnitCreateManyInput[] = [];
    for (const m of wbk.materials) {
      const u = parseUnit(m.unitLabel);
      if (u && !unitId.has(u.code)) {
        const id = randomUUID();
        unitId.set(u.code, id);
        units.push({ id, code: u.code, nameTh: u.nameTh, label: m.unitLabel!, importBatchId: batch.id });
      }
    }
    await tx.unit.createMany({ data: units });

    const matId = new Map(wbk.materials.map((m) => [m.legacyCode, randomUUID()]));
    await inChunks(wbk.materials, (c) =>
      tx.material.createMany({
        data: c.map((m) => ({
          id: matId.get(m.legacyCode)!,
          code: m.code,
          legacyCode: m.legacyCode,
          idChange: m.idChange,
          name: m.name,
          description: m.description,
          kind: m.kind,
          group: m.group,
          primaryCategory: m.primaryCategory,
          secondaryCategory: m.secondaryCategory,
          tertiaryCategory: m.tertiaryCategory,
          proposedCategoryCode: m.proposedCategoryCode,
          proposedCategoryNameTh: m.proposedCategoryNameTh,
          currentCategoryName: m.currentCategoryName,
          currentCategoryCode: m.currentCategoryCode,
          bibleCode: m.bibleCode,
          categoryId: m.bibleCode ? (catId.get(m.bibleCode) ?? null) : null,
          mappingStatus: m.mappingStatus,
          isCancelled: m.isCancelled,
          mappingNote: m.mappingNote,
          crosswalkFlag: m.crosswalkFlag,
          crosswalkEvidence: m.crosswalkEvidence,
          unitLabel: m.unitLabel,
          unitId: parseUnit(m.unitLabel) ? (unitId.get(parseUnit(m.unitLabel)!.code) ?? null) : null,
          storageTemperature: m.storageTemperature,
          importBatchId: batch.id,
          sourceSheet: m.source.sheet,
          sourceRow: m.source.row,
          crosswalkRow: m.crosswalkRow,
          brandSheetRow: m.brandSheetRow,
        })),
      }),
    );

    // brand usage: one row per flag = 1. Flag 0 = not specified = no row.
    const usages: Prisma.MaterialBrandUsageCreateManyInput[] = wbk.materials.flatMap((m) =>
      m.brands.map((b) => ({
        materialId: matId.get(m.legacyCode)!,
        brandId: brands.get(b)!,
        usage: 'used' as const,
        importBatchId: batch.id,
        sourceSheet: 'Meterials (All Brands)',
        sourceRow: m.brandSheetRow,
      })),
    );
    await inChunks(usages, (c) => tx.materialBrandUsage.createMany({ data: c }));

    return {
      materials: wbk.materials.length,
      cancelled: wbk.materials.filter((m) => m.isCancelled).length,
      categories: wbk.categories.length,
      units: units.length,
      brandUsages: usages.length,
      rawRows: wbk.raw.length,
    };
  }, TX));
  return summary;
}

// ---------------------------------------------------------------- SKU (Selling)

export async function importSkus(db: PrismaClient, file: string) {
  const wbk = readSkuWorkbook(file);
  const notDraft = { status: { not: 'draft' as const } };
  await refuseIfNotDraft({
    SKUs: await db.sellingSku.count({ where: notDraft }),
    'POS mappings': await db.posMapping.count({ where: notDraft }),
    'SKU categories': await db.skuCategory.count({ where: notDraft }),
    'brand menu categories': await db.brandMenuCategory.count({ where: notDraft }),
    stores: await db.store.count({ where: notDraft }),
  });

  const batch = await startBatch(db, file);
  const summary = await finishBatch(db, batch.id, db.$transaction(async (tx) => {
    await tx.posMapping.deleteMany({});
    await tx.sellingSku.deleteMany({});
    await tx.skuCategory.deleteMany({});
    await tx.brandMenuCategory.deleteMany({});
    await tx.store.deleteMany({});
    await saveRawRows(tx, batch.id, wbk.raw);
    const brands = await brandIds(tx);
    const brandOf = (code: string) => {
      const id = brands.get(code);
      if (!id) throw new Error(`Unknown brand code ${JSON.stringify(code)} in the SKU workbook`);
      return id;
    };

    const catId = new Map(wbk.categories.map((c) => [c.code, randomUUID()]));
    await tx.skuCategory.createMany({
      data: wbk.categories.map((c) => ({
        id: catId.get(c.code)!,
        code: c.code,
        level: c.level,
        nameEn: c.nameEn,
        nameTh: c.nameTh,
        parentId: c.parentCode ? (catId.get(c.parentCode) ?? null) : null,
        sortOrder: c.sortOrder,
        importBatchId: batch.id,
        sourceSheet: c.source.sheet,
        sourceRow: c.source.row,
      })),
    });

    await tx.brandMenuCategory.createMany({
      data: wbk.brandMenuCategories.map((c) => ({
        brandId: brandOf(c.brand),
        type: c.type,
        menuCategory: c.menuCategory,
        categoryFull: c.categoryFull,
        subcategory: c.subcategory,
        subcategoryFull: c.subcategoryFull,
        prefix: c.prefix,
        sortOrder: c.sortOrder,
        importBatchId: batch.id,
        sourceSheet: c.source.sheet,
        sourceRow: c.source.row,
      })),
    });

    const skuId = new Map(wbk.skus.map((x) => [x.masterRecordKey, randomUUID()]));
    await inChunks(wbk.skus, (c) =>
      tx.sellingSku.createMany({
        data: c.map((x) => ({
          id: skuId.get(x.masterRecordKey)!,
          masterRecordKey: x.masterRecordKey,
          brandId: brandOf(x.brand),
          nameEn: x.nameEn,
          nameTh: x.nameTh,
          l1: x.l1,
          l2En: x.l2En,
          l2Th: x.l2Th,
          l3En: x.l3En,
          l3Th: x.l3Th,
          categoryCode: x.categoryCode,
          centralCategoryId: x.categoryCode ? (catId.get(x.categoryCode) ?? null) : null,
          brandMenuCategory: x.brandMenuCategory,
          brandMenuSubcategory: x.brandMenuSubcategory,
          reviewNote: x.reviewNote,
          sheetBrandFlags: x.sheetBrandFlags,
          importBatchId: batch.id,
          sourceSheet: x.source.sheet,
          sourceRow: x.source.row,
        })),
      }),
    );

    // stores, as named in the POS snapshot
    const storeId = new Map<string, string>();
    const stores: Prisma.StoreCreateManyInput[] = [];
    const posRows = wbk.pos.filter((p) => skuId.has(p.masterRecordKey));
    for (const p of posRows) {
      const brand = p.brand ?? p.masterRecordKey.split(':')[0]!;
      const key = `${brand}|${p.store ?? ''}`;
      if (p.store && !storeId.has(key)) {
        const id = randomUUID();
        storeId.set(key, id);
        stores.push({ id, brandId: brandOf(brand), name: p.store, importBatchId: batch.id });
      }
    }
    await tx.store.createMany({ data: stores });

    const posData: Prisma.PosMappingCreateManyInput[] = posRows
      .filter((p) => p.store)
      .map((p) => ({
        skuId: skuId.get(p.masterRecordKey)!,
        storeId: storeId.get(`${p.brand ?? p.masterRecordKey.split(':')[0]}|${p.store}`)!,
        posSkuCode: p.posSkuCode,
        posInternalId: p.posInternalId,
        posLabel: p.posLabel,
        posGroup: p.posGroup,
        posCategory: p.posCategory,
        price: p.price,
        salesStatus: p.salesStatus,
        presentInPos: p.presentInPos,
        readyToSell: p.readyToSell,
        snapshotDate: p.snapshotDate,
        sourceUrl: p.sourceUrl,
        importBatchId: batch.id,
        sourceSheet: p.source.sheet,
        sourceRow: p.source.row,
      }));
    await inChunks(posData, (c) => tx.posMapping.createMany({ data: c }));

    return {
      skus: wbk.skus.length,
      posMappings: posData.length,
      posRowsWithoutSku: wbk.pos.length - posRows.length,
      stores: stores.length,
      skuCategories: wbk.categories.length,
      brandMenuCategories: wbk.brandMenuCategories.length,
      rawRows: wbk.raw.length,
    };
  }, TX));
  return summary;
}

export async function importAll(db: PrismaClient, dir = dataDir()) {
  const files = [join(dir, MATERIAL_FILE), join(dir, SKU_FILE)];
  for (const f of files) if (!existsSync(f)) throw new Error(`Source workbook not found: ${f}\nSet TKG_DATA_DIR in .env.`);
  await seed(db);
  const materials = await importMaterials(db, files[0]!);
  const skus = await importSkus(db, files[1]!);
  return { materials, skus };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { prisma } = await import('./client');
  try {
    const t0 = Date.now();
    const r = await importAll(prisma);
    console.log('materials', r.materials);
    console.log('skus', r.skus);
    console.log(`imported as draft in ${((Date.now() - t0) / 1000).toFixed(1)}s from ${dataDir()}`);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
