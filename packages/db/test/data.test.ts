// Data tests: run after `pnpm db:import`. They check the database against the counts the approved prototype shows.
import { afterAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { filters, POS_SALES_STATUS } from '../src/index';

const db = new PrismaClient();
afterAll(() => db.$disconnect());

const BRANDS = ['TK', 'HK', 'NT', 'OK'] as const;

describe('import ran', () => {
  it('has a completed batch for each workbook', async () => {
    const batches = await db.importBatch.findMany({ where: { status: 'completed' } });
    const files = new Set(batches.map((b) => b.sourceFile));
    expect(files.has('TKG Material Master Data (All Aspect) - Working Sheet.xlsx')).toBe(true);
    expect(files.has('Selling SKU Master Data — TK + HK + NT + OK.xlsx')).toBe(true);
  });
});

describe('materials', () => {
  it('has 1,194 materials, 1,192 not cancelled', async () => {
    expect(await db.material.count()).toBe(1194);
    expect(await db.material.count({ where: filters.activeMaterials })).toBe(1192);
    expect(await db.material.count({ where: { isCancelled: true, mappingStatus: 'ยกเลิก' } })).toBe(2);
  });

  it('keeps 109 changed IDs with their legacy ID', async () => {
    const all = await db.material.findMany({ select: { code: true, legacyCode: true, idChange: true } });
    const changed = all.filter((m) => m.code !== m.legacyCode);
    expect(changed).toHaveLength(109);
    expect(new Set(changed.map((m) => m.idChange))).toEqual(new Set(['เปลี่ยน ID ตามหมวดที่ยืนยัน']));
  });

  it('brand usage: TK 597 · HK 404 · NT 367 · OK 199', async () => {
    const expected = { TK: 597, HK: 404, NT: 367, OK: 199 };
    for (const b of BRANDS) {
      expect(await db.material.count({ where: filters.usedByBrand(b) }), b).toBe(expected[b]);
    }
  });

  it('never turns a 0 flag into "not used"', async () => {
    expect(await db.materialBrandUsage.count({ where: { usage: 'not_used' } })).toBe(0);
  });

  it('shared and not-specified counts match the context document', async () => {
    const active = await db.material.findMany({
      where: filters.activeMaterials,
      select: { _count: { select: { brandUsages: { where: { usage: 'used' } } } } },
    });
    expect(active.filter((m) => m._count.brandUsages >= 2)).toHaveLength(362);
    expect(active.filter((m) => m._count.brandUsages === 0)).toHaveLength(148);
    expect(await db.material.count({ where: { AND: [filters.activeMaterials, filters.noBrandSpecified] } })).toBe(148);
  });

  it('category review queues: 67 decide · 277 move · 1 check · 9 SM', async () => {
    expect(await db.material.count({ where: { mappingStatus: 'ต้องตัดสินใจ' } })).toBe(67);
    expect(await db.material.count({ where: { mappingStatus: 'ย้ายหมวด' } })).toBe(277);
    expect(await db.material.count({ where: { crosswalkFlag: 'ต้องตรวจสอบ' } })).toBe(1);
    expect(await db.material.count({ where: { AND: [filters.activeMaterials, filters.materialGroup('SM')] } })).toBe(9);
  });

  it('Bible tree is 21 · 101 · 22 and every child sits under its parent code', async () => {
    const cats = await db.materialCategory.findMany({ include: { parent: true } });
    const byLevel = (l: number) => cats.filter((c) => c.level === l).length;
    expect([byLevel(1), byLevel(2), byLevel(3)]).toEqual([21, 101, 22]);
    for (const c of cats) {
      if (c.level === 1) expect(c.parent).toBeNull();
      else expect(c.code.startsWith(`${c.parent!.code}_`), c.code).toBe(true);
    }
    expect(await db.material.count({ where: { secondaryCategory: 'PORK', categoryId: { not: null } } })).toBe(27);
  });

  it('pork filter: category PORK or a pork word in a food item name, never spare parts', async () => {
    const all = await db.material.findMany({ select: { code: true, name: true, group: true, secondaryCategory: true } });
    const expected = all.filter(
      (m) => m.secondaryCategory === 'PORK' || (m.group !== 'SP' && /หมู|เบคอน|แฮม|bacon|pork/i.test(m.name)),
    );
    expect(expected.length).toBeGreaterThan(27);
    const pork = await db.material.findMany({ where: filters.porkMaterials, select: { code: true } });
    expect(pork.map((m) => m.code).sort()).toEqual(expected.map((m) => m.code).sort());
    expect(pork.some((m) => m.code === 'CS_OTHERS_0014')).toBe(false); // slicer spring
    expect(pork.some((m) => m.code === 'FG_MEAT_0016')).toBe(true); // เบคอน
  });
});

describe('SKU (Selling)', () => {
  it('has 2,418 SKUs, each with one POS mapping and no TKG code allocated yet', async () => {
    expect(await db.sellingSku.count()).toBe(2418);
    expect(await db.posMapping.count()).toBe(2418);
    expect(await db.sellingSku.count({ where: { posMappings: { none: {} } } })).toBe(0);
    expect(await db.sellingSku.count({ where: { tkgCode: { not: null } } })).toBe(0);
  });

  it('POS snapshot: 2,375 ready · 43 paused', async () => {
    expect(await db.posMapping.count({ where: { salesStatus: POS_SALES_STATUS.ready } })).toBe(2375);
    expect(await db.posMapping.count({ where: { salesStatus: POS_SALES_STATUS.paused } })).toBe(43);
  });

  it('per brand: TK 704 · HK 1,007 · NT 402 · OK 305', async () => {
    const expected = { TK: 704, HK: 1007, NT: 402, OK: 305 };
    for (const b of BRANDS) expect(await db.sellingSku.count({ where: { brand: { code: b } } }), b).toBe(expected[b]);
  });

  it('POS codes are mappings to the TKG key, scoped to one store of the same brand', async () => {
    const rows = await db.posMapping.findMany({ include: { sku: true, store: true } });
    for (const p of rows) {
      expect(p.store.brandId).toBe(p.sku.brandId);
      expect(p.sku.masterRecordKey).not.toBe(p.posSkuCode);
    }
    expect(await db.store.count()).toBe(4);
  });

  it('SKU fields are stored as in the sheet: no category code yet, 62 without subcategory', async () => {
    expect(await db.sellingSku.count({ where: { categoryCode: null } })).toBe(2418);
    expect(await db.sellingSku.count({ where: { l3En: null } })).toBe(62);
  });

  it('central and brand menu categories are loaded', async () => {
    expect(await db.skuCategory.count({ where: { level: 3 } })).toBe(130);
    expect(await db.brandMenuCategory.count()).toBe(202);
  });
});

describe('draft and provenance', () => {
  it('nothing imported is approved', async () => {
    const notDraft = { status: { not: 'draft' as const } };
    const counts = await Promise.all([
      db.material.count({ where: notDraft }),
      db.materialCategory.count({ where: notDraft }),
      db.materialBrandUsage.count({ where: notDraft }),
      db.unit.count({ where: notDraft }),
      db.sellingSku.count({ where: notDraft }),
      db.posMapping.count({ where: notDraft }),
      db.skuCategory.count({ where: notDraft }),
      db.brandMenuCategory.count({ where: notDraft }),
      db.store.count({ where: notDraft }),
    ]);
    expect(counts.every((n) => n === 0)).toBe(true);
  });

  it('every record points back to its source row, and the raw row holds the same value', async () => {
    const m = await db.material.findFirstOrThrow({ orderBy: { sourceRow: 'asc' } });
    const raw = await db.importRow.findUniqueOrThrow({
      where: { batchId_sheet_rowNo: { batchId: m.importBatchId, sheet: m.sourceSheet, rowNo: m.sourceRow } },
    });
    expect((raw.raw as Record<string, string>).C?.trim()).toBe(m.name);

    const sku = await db.sellingSku.findFirstOrThrow({ orderBy: { sourceRow: 'asc' } });
    const skuRaw = await db.importRow.findUniqueOrThrow({
      where: { batchId_sheet_rowNo: { batchId: sku.importBatchId, sheet: sku.sourceSheet, rowNo: sku.sourceRow } },
    });
    expect((skuRaw.raw as Record<string, string>).C?.trim()).toBe(sku.masterRecordKey);

    expect(await db.material.count({ where: { OR: [{ sourceRow: { lt: 1 } }, { crosswalkRow: null }, { brandSheetRow: null }] } })).toBe(0);
    expect(await db.posMapping.count({ where: { sourceRow: { lt: 1 } } })).toBe(0);
  });
});
