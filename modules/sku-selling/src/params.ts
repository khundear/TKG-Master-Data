// URL filters for the SKU pages. Pure functions (no DB, no React) so they can be tested on their own.
// Filters live in the URL so links from the overview, gaps and category pages land on a filtered list.
import type { Prisma } from '@tkg/db';

export type SearchParams = Record<string, string | string[] | undefined>;

/** Value of the type (L1) filter meaning "type is empty in the sheet". */
export const NONE = '__none';

/** Gap filters reachable from ข้อมูลที่ต้องเติม. */
export const GAPS = ['note', 'pos', 'price', 'l1'] as const;
export type Gap = (typeof GAPS)[number];

export const BRAND_CODES = ['TK', 'HK', 'NT', 'OK'] as const;

/**
 * POS snapshot sales status values, the same as POS_SALES_STATUS in @tkg/db (queries.ts checks this at compile time).
 * Repeated here so client components do not import the database package.
 */
export const SALES_STATUS = { ready: 'พร้อมขาย', paused: 'งดขายชั่วคราว' } as const;

export interface SkuListFilters {
  br: string;
  q: string;
  l1: string;
  l2: string;
  status: string;
  gap: Gap | '';
  page: number;
}

export interface PosFilters {
  br: string;
  q: string;
  page: number;
}

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? (v[0] ?? '') : (v ?? '')).trim();
const brand = (v: string): string => ((BRAND_CODES as readonly string[]).includes(v) ? v : '');
export const pageOf = (v: string | string[] | undefined): number => {
  const n = Number.parseInt(one(v), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

export function parseListFilters(sp: SearchParams): SkuListFilters {
  const gap = one(sp.gap);
  return {
    br: brand(one(sp.br)),
    q: one(sp.q),
    l1: one(sp.l1),
    l2: one(sp.l2),
    status: one(sp.status),
    gap: (GAPS as readonly string[]).includes(gap) ? (gap as Gap) : '',
    page: pageOf(sp.page),
  };
}

export function parsePosFilters(sp: SearchParams): PosFilters {
  return { br: brand(one(sp.br)), q: one(sp.q), page: pageOf(sp.page) };
}

/** Builds `base?…` from the non-empty values; page 1 is left out. */
export function buildHref(base: string, values: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(values)) {
    if (v === undefined || v === '' || (k === 'page' && Number(v) <= 1)) continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

export const LIST_PATH = '/sku/list';

/** Link to the SKU list with these filters (anything not given is empty). */
export function listHref(f: Partial<SkuListFilters> = {}): string {
  return buildHref(LIST_PATH, { br: f.br, q: f.q, l1: f.l1, l2: f.l2, status: f.status, gap: f.gap, page: f.page });
}

/** Current filters with a change applied. Any change other than the page goes back to page 1; a new type clears L2. */
export function patchFilters(f: SkuListFilters, patch: Partial<SkuListFilters>): SkuListFilters {
  const next = { ...f, ...patch };
  if (!('page' in patch)) next.page = 1;
  if ('l1' in patch && patch.l1 !== f.l1 && !('l2' in patch)) next.l2 = '';
  return next;
}

export const hasActiveFilters = (f: SkuListFilters): boolean => [f.q, f.br, f.l1, f.l2, f.status, f.gap].some(Boolean);

/** Clamp a page number to the pages that exist. */
export const clampPage = (page: number, total: number, perPage: number): number =>
  Math.min(Math.max(1, page), Math.max(1, Math.ceil(total / perPage)));

/** Search over Thai / English names, Master Record Key, POS internal ID and POS SKU code. */
export function searchWhere(q: string): Prisma.SellingSkuWhereInput | undefined {
  if (!q) return undefined;
  const has = { contains: q, mode: 'insensitive' as const };
  return {
    OR: [
      { nameEn: has },
      { nameTh: has },
      { masterRecordKey: has },
      { posMappings: { some: { OR: [{ posInternalId: has }, { posSkuCode: has }] } } },
    ],
  };
}

/** Prisma `where` for the SKU list. Status is the POS snapshot status on the mapping, not an approval. */
export function skuWhere(f: Omit<SkuListFilters, 'page'>): Prisma.SellingSkuWhereInput {
  const and: Prisma.SellingSkuWhereInput[] = [];
  if (f.br) and.push({ brand: { code: f.br } });
  if (f.l1) and.push({ l1: f.l1 === NONE ? null : f.l1 });
  if (f.l2) and.push({ l2Th: f.l2 });
  if (f.status) and.push({ posMappings: { some: { salesStatus: f.status } } });
  if (f.gap === 'note') and.push({ reviewNote: { not: null } }, { NOT: { reviewNote: '' } });
  if (f.gap === 'l1') and.push({ l1: null });
  if (f.gap === 'pos') and.push({ posMappings: { none: { posSkuCode: { not: null } } } });
  if (f.gap === 'price') and.push({ OR: [{ posMappings: { none: {} } }, { posMappings: { some: { price: null } } }] });
  const s = searchWhere(f.q);
  if (s) and.push(s);
  return and.length ? { AND: and } : {};
}

/** Prisma `where` for the POS code page (one row per POS mapping). */
export function posWhere(f: PosFilters): Prisma.PosMappingWhereInput {
  const and: Prisma.PosMappingWhereInput[] = [];
  if (f.br) and.push({ sku: { brand: { code: f.br } } });
  if (f.q) {
    const has = { contains: f.q, mode: 'insensitive' as const };
    and.push({ OR: [{ sku: { masterRecordKey: has } }, { posInternalId: has }, { posSkuCode: has }, { posLabel: has }] });
  }
  return and.length ? { AND: and } : {};
}
