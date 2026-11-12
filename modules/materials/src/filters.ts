// Material list filters. They live in the URL so links from the overview, categories and units pages work.
//   /materials/list?br=TK&grp=RM&p1=PROTEIN&st=ย้ายหมวด&pork=1&bible=RM_PROTN&unit=EA&q=หมู&page=2
import type { Prisma } from '@tkg/db';
import { filters as dbFilters } from '@tkg/db';
import { BRAND_CODES } from './labels';

export type BrandFilter = '' | (typeof BRAND_CODES)[number] | 'multi' | 'none';
export type GroupFilter = '' | 'RM' | 'SP' | 'SM';

export interface MaterialFilter {
  /** ID, legacy ID, name or proposed category name. */
  q: string;
  grp: GroupFilter;
  /** Primary category code, e.g. PROTEIN. */
  p1: string;
  /** One brand, used by 2+ brands, or no brand specified. */
  br: BrandFilter;
  /** Mapping status. Empty = every status except ยกเลิก. */
  st: string;
  /** มีหมู. */
  pork: boolean;
  /** Bible category code; matches the code and every code under it. */
  bible: string;
  /** Unit code (EA), the raw label when it has no unit, or 'none'. */
  unit: string;
  page: number;
}

export const EMPTY_FILTER: MaterialFilter = { q: '', grp: '', p1: '', br: '', st: '', pork: false, bible: '', unit: '', page: 1 };

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

const one = (p: Params, k: string): string => {
  const v = p instanceof URLSearchParams ? p.get(k) : p[k];
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? '';
};

export function parseFilter(p: Params): MaterialFilter {
  const grp = one(p, 'grp');
  const br = one(p, 'br');
  const page = Number.parseInt(one(p, 'page'), 10);
  return {
    q: one(p, 'q').slice(0, 100),
    grp: grp === 'RM' || grp === 'SP' || grp === 'SM' ? grp : '',
    p1: one(p, 'p1'),
    br: (BRAND_CODES as readonly string[]).includes(br) || br === 'multi' || br === 'none' ? (br as BrandFilter) : '',
    st: one(p, 'st'),
    pork: one(p, 'pork') === '1',
    bible: one(p, 'bible'),
    unit: one(p, 'unit'),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Query string for a filter (only the fields that are set). `page` 1 is left out. */
export function filterQuery(f: Partial<MaterialFilter>): string {
  const s = new URLSearchParams();
  if (f.q) s.set('q', f.q);
  if (f.br) s.set('br', f.br);
  if (f.grp) s.set('grp', f.grp);
  if (f.p1) s.set('p1', f.p1);
  if (f.st) s.set('st', f.st);
  if (f.pork) s.set('pork', '1');
  if (f.bible) s.set('bible', f.bible);
  if (f.unit) s.set('unit', f.unit);
  if (f.page && f.page > 1) s.set('page', String(f.page));
  const qs = s.toString();
  return qs ? `?${qs}` : '';
}

export const LIST_PATH = '/materials/list';
/** Link to the material list with these filters. */
export const listHref = (f: Partial<MaterialFilter> = {}): string => `${LIST_PATH}${filterQuery(f)}`;

/** True when any filter is set (the "clear filters" link shows). */
export const hasFilter = (f: MaterialFilter): boolean =>
  Boolean(f.q || f.grp || f.p1 || f.br || f.st || f.pork || f.bible || f.unit);

/**
 * Prisma `where` for a filter. `multiIds` are the materials used by 2+ brands (Prisma cannot count a relation in a
 * where clause); pass them when `br` is 'multi'.
 */
export function materialWhere(f: MaterialFilter, multiIds: string[] = []): Prisma.MaterialWhereInput {
  const and: Prisma.MaterialWhereInput[] = [];
  and.push(f.st ? { mappingStatus: f.st } : dbFilters.activeMaterials);
  if (f.grp) and.push(dbFilters.materialGroup(f.grp));
  if (f.p1) and.push({ primaryCategory: f.p1 });
  if (f.pork) and.push(dbFilters.porkMaterials);
  if (f.bible) and.push({ OR: [{ bibleCode: f.bible }, { bibleCode: { startsWith: `${f.bible}_` } }] });
  if (f.unit === 'none') and.push({ unitLabel: null });
  else if (f.unit) and.push({ OR: [{ unit: { code: f.unit } }, { unitId: null, unitLabel: f.unit }] });
  if (f.br === 'none') and.push(dbFilters.noBrandSpecified);
  else if (f.br === 'multi') and.push({ id: { in: multiIds } });
  else if (f.br) and.push(dbFilters.usedByBrand(f.br));
  if (f.q) {
    const contains = { contains: f.q, mode: 'insensitive' as const };
    and.push({
      OR: [{ code: contains }, { legacyCode: contains }, { name: contains }, { proposedCategoryNameTh: contains }],
    });
  }
  return { AND: and };
}

/** Group as the prototype shows it: "คงไว้เป็น SM" counts as SM. */
export const groupOf = (m: { group: string | null; mappingStatus: string }): string =>
  m.mappingStatus === 'คงไว้เป็น SM' ? 'SM' : (m.group ?? '');

/** Bible filter test used for counts in memory (same rule as `materialWhere`). */
export const inBible = (bibleCode: string | null, code: string): boolean =>
  !!bibleCode && (bibleCode === code || bibleCode.startsWith(`${code}_`));
