// Database reads for the SKU (Selling) pages. Server only.
// SKU data is shown exactly as stored (not final, not cleansed). Everything imported is draft.
import { BRANDS, POS_SALES_STATUS, prisma, type Prisma } from '@tkg/db';
import { NONE, SALES_STATUS, clampPage, posWhere, skuWhere, type PosFilters, type SkuListFilters } from './params';
import type { BrandStat, CategoryNode, PosRow, SkuMapping, SkuRow, StoreStat } from './types';

export const PER_PAGE = 50;

// The client-side copy of the POS status values must match the database package's.
const sameStatus: typeof POS_SALES_STATUS = SALES_STATUS;
void sameStatus;

const skuInclude = {
  brand: { select: { code: true } },
  posMappings: { include: { store: { select: { name: true } } }, orderBy: { store: { name: 'asc' } } },
} satisfies Prisma.SellingSkuInclude;
type SkuWithPos = Prisma.SellingSkuGetPayload<{ include: typeof skuInclude }>;

const day = (d: Date | null): string | null => (d ? d.toISOString().slice(0, 10) : null);
const num = (d: Prisma.Decimal | null): number | null => (d == null ? null : Number(d));

function toRow(s: SkuWithPos): SkuRow {
  const mappings: SkuMapping[] = s.posMappings.map((m) => ({
    id: m.id,
    store: m.store.name,
    posInternalId: m.posInternalId,
    posSkuCode: m.posSkuCode,
    posLabel: m.posLabel,
    posGroup: m.posGroup,
    posCategory: m.posCategory,
    price: num(m.price),
    salesStatus: m.salesStatus,
    snapshotDate: day(m.snapshotDate),
  }));
  return {
    key: s.masterRecordKey,
    tkgCode: s.tkgCode,
    brand: s.brand.code,
    nameEn: s.nameEn,
    nameTh: s.nameTh,
    l1: s.l1,
    l2En: s.l2En,
    l2Th: s.l2Th,
    l3En: s.l3En,
    l3Th: s.l3Th,
    categoryCode: s.categoryCode,
    brandMenuCategory: s.brandMenuCategory,
    brandMenuSubcategory: s.brandMenuSubcategory,
    reviewNote: s.reviewNote || null,
    status: s.status,
    salesStatus: mappings[0]?.salesStatus ?? null,
    price: mappings[0]?.price ?? null,
    mappings,
    sourceSheet: s.sourceSheet,
    sourceRow: s.sourceRow,
  };
}

const paused = { posMappings: { some: { salesStatus: POS_SALES_STATUS.paused } } } satisfies Prisma.SellingSkuWhereInput;
const ready = { posMappings: { some: { salesStatus: POS_SALES_STATUS.ready } } } satisfies Prisma.SellingSkuWhereInput;

/** Counts for the left menu. */
export async function getNavCounts() {
  const [total, noCategoryCode, pausedCount] = await Promise.all([
    prisma.sellingSku.count(),
    prisma.sellingSku.count({ where: { categoryCode: null } }),
    prisma.sellingSku.count({ where: paused }),
  ]);
  return { total, noCategoryCode, paused: pausedCount };
}

async function brandStats(): Promise<BrandStat[]> {
  const brands = await prisma.brand.findMany({
    select: {
      id: true,
      code: true,
      nameTh: true,
      stores: { select: { name: true }, orderBy: { name: 'asc' } },
      _count: { select: { sellingSkus: true } },
    },
  });
  const [readyBy, pausedBy] = await Promise.all([
    prisma.sellingSku.groupBy({ by: ['brandId'], where: ready, _count: true }),
    prisma.sellingSku.groupBy({ by: ['brandId'], where: paused, _count: true }),
  ]);
  const idOf = Object.fromEntries(brands.map((b) => [b.code, b.id]));
  const count = (rows: { brandId: string; _count: number }[], code: string) =>
    rows.find((r) => r.brandId === idOf[code])?._count ?? 0;
  return BRANDS.map(({ code }) => brands.find((b) => b.code === code))
    .filter((b): b is (typeof brands)[number] => !!b)
    .map((b) => ({
      code: b.code,
      name: b.nameTh,
      stores: b.stores.map((s) => s.name),
      total: b._count.sellingSkus,
      ready: count(readyBy, b.code),
      paused: count(pausedBy, b.code),
    }));
}

export async function getOverview() {
  const [total, readyCount, pausedCount, noCategoryCode, byBrand, types, snap, l2, l3, brandMenu] = await Promise.all([
    prisma.sellingSku.count(),
    prisma.sellingSku.count({ where: ready }),
    prisma.sellingSku.count({ where: paused }),
    prisma.sellingSku.count({ where: { categoryCode: null } }),
    brandStats(),
    prisma.sellingSku.groupBy({ by: ['l1'], _count: true }),
    prisma.posMapping.aggregate({ _min: { snapshotDate: true }, _max: { snapshotDate: true } }),
    prisma.skuCategory.count({ where: { level: 2 } }),
    prisma.skuCategory.count({ where: { level: 3 } }),
    prisma.brandMenuCategory.count(),
  ]);
  return {
    total,
    ready: readyCount,
    paused: pausedCount,
    noCategoryCode,
    byBrand,
    byType: types
      .map((t) => ({ l1: t.l1, count: t._count }))
      .sort((a, b) => b.count - a.count),
    snapshotFrom: day(snap._min.snapshotDate),
    snapshotTo: day(snap._max.snapshotDate),
    categories: { l2, l3 },
    brandMenuCategories: brandMenu,
  };
}

/** SKU list: one page of rows plus everything the filter bar needs. */
export async function listSkus(f: SkuListFilters) {
  const where = skuWhere(f);
  const [total, all, byBrand, l1s, l2s] = await Promise.all([
    prisma.sellingSku.count({ where }),
    prisma.sellingSku.count(),
    prisma.sellingSku.groupBy({ by: ['brandId'], _count: true }),
    prisma.sellingSku.groupBy({ by: ['l1'], _count: true }),
    prisma.sellingSku.findMany({
      where: { l2Th: { not: null }, ...(f.l1 ? { l1: f.l1 === NONE ? null : f.l1 } : {}) },
      distinct: ['l2Th'],
      select: { l2Th: true },
    }),
  ]);
  const page = clampPage(f.page, total, PER_PAGE);
  const rows = await prisma.sellingSku.findMany({
    where,
    include: skuInclude,
    orderBy: { sourceRow: 'asc' },
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
  });
  const brands = await prisma.brand.findMany({ select: { id: true, code: true, nameTh: true } });
  return {
    total,
    page,
    rows: rows.map(toRow),
    brandCounts: BRANDS.map(({ code }) => {
      const b = brands.find((x) => x.code === code);
      return { code, name: b?.nameTh ?? code, count: byBrand.find((r) => r.brandId === b?.id)?._count ?? 0 };
    }),
    allCount: all,
    l1Options: l1s
      .sort((a, b) => b._count - a._count)
      .map((t) => t.l1 ?? NONE),
    l2Options: l2s.map((r) => r.l2Th!).sort((a, b) => a.localeCompare(b, 'th')),
  };
}

/** One row per store (as named by the POS), from the POS mappings. */
export async function getStores(): Promise<StoreStat[]> {
  const stores = await prisma.store.findMany({
    include: { brand: { select: { code: true, nameTh: true } } },
  });
  const [all, readyBy, pausedBy, avg, snap] = await Promise.all([
    prisma.posMapping.groupBy({ by: ['storeId'], _count: true }),
    prisma.posMapping.groupBy({ by: ['storeId'], where: { salesStatus: POS_SALES_STATUS.ready }, _count: true }),
    prisma.posMapping.groupBy({ by: ['storeId'], where: { salesStatus: POS_SALES_STATUS.paused }, _count: true }),
    prisma.posMapping.groupBy({ by: ['storeId'], _avg: { price: true } }),
    prisma.posMapping.groupBy({ by: ['storeId'], _min: { snapshotDate: true }, _max: { snapshotDate: true } }),
  ]);
  const pick = <T extends { storeId: string }>(rows: T[], id: string) => rows.find((r) => r.storeId === id);
  const order = BRANDS.map((b) => b.code as string);
  return stores
    .map((s) => {
      const from = day(pick(snap, s.id)?._min.snapshotDate ?? null);
      const to = day(pick(snap, s.id)?._max.snapshotDate ?? null);
      return {
        name: s.name,
        brand: s.brand.code,
        brandName: s.brand.nameTh,
        total: pick(all, s.id)?._count ?? 0,
        ready: pick(readyBy, s.id)?._count ?? 0,
        paused: pick(pausedBy, s.id)?._count ?? 0,
        avgPrice: num(pick(avg, s.id)?._avg.price ?? null),
        snapshot: from && to && from !== to ? `${from} – ${to}` : from,
      };
    })
    .sort((a, b) => order.indexOf(a.brand) - order.indexOf(b.brand) || a.name.localeCompare(b.name, 'th'));
}

/** POS codes: one row per POS mapping, each pointing (↔) at the SKU's Master Record Key. */
export async function listPos(f: PosFilters) {
  const where = posWhere(f);
  const [total, all, withInternalId, withSkuCode] = await Promise.all([
    prisma.posMapping.count({ where }),
    prisma.posMapping.count(),
    prisma.posMapping.count({ where: { posInternalId: { not: null } } }),
    prisma.posMapping.count({ where: { posSkuCode: { not: null } } }),
  ]);
  const page = clampPage(f.page, total, PER_PAGE);
  const rows = await prisma.posMapping.findMany({
    where,
    include: { store: { select: { name: true } }, sku: { include: skuInclude } },
    orderBy: [{ sku: { sourceRow: 'asc' } }, { store: { name: 'asc' } }],
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
  });
  const out: PosRow[] = rows.map((m) => ({
    id: m.id,
    key: m.sku.masterRecordKey,
    posInternalId: m.posInternalId,
    posSkuCode: m.posSkuCode,
    posLabel: m.posLabel,
    posGroup: m.posGroup,
    posCategory: m.posCategory,
    store: m.store.name,
    sku: toRow(m.sku),
  }));
  return { total, page, rows: out, all, withInternalId, withSkuCode };
}

/** Central SKU category tree (L1 · L2 · L3) with how many SKUs name each one. */
export async function getCategoryTree(): Promise<CategoryNode[]> {
  const [cats, byL1, byL2, byL3] = await Promise.all([
    prisma.skuCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.sellingSku.groupBy({ by: ['l1'], _count: true }),
    prisma.sellingSku.groupBy({ by: ['l2En'], _count: true }),
    prisma.sellingSku.groupBy({ by: ['l2En', 'l3En'], _count: true }),
  ]);
  const byId = new Map(cats.map((c) => [c.id, c]));
  return cats.map((c) => {
    const parent = c.parentId ? byId.get(c.parentId) : undefined;
    let count = 0;
    if (c.level === 1) count = byL1.find((r) => r.l1 === c.nameTh)?._count ?? 0;
    if (c.level === 2) count = byL2.find((r) => r.l2En === c.nameEn)?._count ?? 0;
    if (c.level === 3) count = byL3.find((r) => r.l2En === parent?.nameEn && r.l3En === c.nameEn)?._count ?? 0;
    // L3 rows open the list on their L2 (the list filters by L2), as in the prototype.
    const l2Th = c.level === 2 ? c.nameTh : c.level === 3 ? (parent?.nameTh ?? null) : null;
    return { code: c.code, level: c.level, nameEn: c.nameEn, nameTh: c.nameTh, count, l2Th };
  });
}

/** One brand's menu categories (flat, as in the sheet) with SKU counts. */
export async function getBrandMenuCategories(brand: string) {
  const [brands, perBrand] = await Promise.all([
    prisma.brand.findMany({ select: { id: true, code: true, nameTh: true } }),
    prisma.brandMenuCategory.groupBy({ by: ['brandId'], _count: true }),
  ]);
  const b = brands.find((x) => x.code === brand);
  const [rows, counts] = b
    ? await Promise.all([
        prisma.brandMenuCategory.findMany({ where: { brandId: b.id }, orderBy: { sortOrder: 'asc' } }),
        prisma.sellingSku.groupBy({
          by: ['brandMenuCategory', 'brandMenuSubcategory'],
          where: { brandId: b.id },
          _count: true,
        }),
      ])
    : [[], []];
  const n = (cat: string | null, sub: string | null) =>
    counts.find((c) => c.brandMenuCategory === cat && c.brandMenuSubcategory === sub)?._count ?? 0;
  return {
    brands: BRANDS.map(({ code }) => {
      const x = brands.find((y) => y.code === code);
      return { code, name: x?.nameTh ?? code, count: perBrand.find((p) => p.brandId === x?.id)?._count ?? 0 };
    }),
    rows: rows.map((r) => ({
      id: r.id,
      type: r.type,
      category: r.categoryFull ?? r.menuCategory,
      subcategory: r.subcategoryFull ?? r.subcategory,
      prefix: r.prefix,
      count: n(r.categoryFull, r.subcategoryFull) || n(r.menuCategory, r.subcategory),
    })),
  };
}

/** Counts for ข้อมูลที่ต้องเติม. */
export async function getGaps() {
  const [total, code, note, pos, price, l1] = await Promise.all([
    prisma.sellingSku.count(),
    prisma.sellingSku.count({ where: { categoryCode: null } }),
    prisma.sellingSku.count({ where: skuWhere({ br: '', q: '', l1: '', l2: '', status: '', gap: 'note' }) }),
    prisma.sellingSku.count({ where: skuWhere({ br: '', q: '', l1: '', l2: '', status: '', gap: 'pos' }) }),
    prisma.sellingSku.count({ where: skuWhere({ br: '', q: '', l1: '', l2: '', status: '', gap: 'price' }) }),
    prisma.sellingSku.count({ where: skuWhere({ br: '', q: '', l1: '', l2: '', status: '', gap: 'l1' }) }),
  ]);
  return { total, code, note, pos, price, l1 };
}

/** งดขายชั่วคราว: SKUs whose POS snapshot says paused. */
export async function listPaused(pageIn: number) {
  const [total, byBrand, brands] = await Promise.all([
    prisma.sellingSku.count({ where: paused }),
    prisma.sellingSku.groupBy({ by: ['brandId'], where: paused, _count: true }),
    prisma.brand.findMany({ select: { id: true, code: true } }),
  ]);
  const page = clampPage(pageIn, total, PER_PAGE);
  const rows = await prisma.sellingSku.findMany({
    where: paused,
    include: skuInclude,
    orderBy: { sourceRow: 'asc' },
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
  });
  return {
    total,
    page,
    rows: rows.map(toRow),
    byBrand: BRANDS.map(({ code }) => {
      const id = brands.find((b) => b.code === code)?.id;
      return { code, count: byBrand.find((r) => r.brandId === id)?._count ?? 0 };
    }),
  };
}
