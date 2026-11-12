// Database reads for the Materials pages (server only). Everything read here is draft data from the sheets.
import { MATERIAL_MAPPING_STATUS, filters as dbFilters, prisma, type Prisma } from '@tkg/db';
import { PER_PAGE } from '@tkg/ui';
import { groupOf, materialWhere, type MaterialFilter } from './filters';
import type { MaterialRow } from './types';

const rowInclude = {
  unit: true,
  brandUsages: { where: { usage: 'used' }, select: { brand: { select: { code: true } } } },
} satisfies Prisma.MaterialInclude;
type MaterialWithRels = Prisma.MaterialGetPayload<{ include: typeof rowInclude }>;

const BRAND_SORT = ['TK', 'HK', 'NT', 'OK'];

export function toRow(m: MaterialWithRels): MaterialRow {
  return {
    code: m.code,
    legacyCode: m.legacyCode,
    idChange: m.idChange,
    name: m.name,
    description: m.description,
    kind: m.kind,
    group: groupOf(m),
    primary: m.primaryCategory,
    secondary: m.secondaryCategory,
    tertiary: m.tertiaryCategory,
    proposedCode: m.proposedCategoryCode,
    categoryTh: m.proposedCategoryNameTh,
    currentCategory: m.currentCategoryName,
    currentCategoryCode: m.currentCategoryCode,
    bibleCode: m.bibleCode,
    mappingStatus: m.mappingStatus,
    crosswalkFlag: m.crosswalkFlag,
    note: m.mappingNote,
    unitLabel: m.unitLabel,
    unitName: m.unit?.nameTh ?? null,
    temperature: m.storageTemperature,
    brands: m.brandUsages.map((u) => u.brand.code).sort((a, b) => BRAND_SORT.indexOf(a) - BRAND_SORT.indexOf(b)),
    status: m.status,
    sourceSheet: m.sourceSheet,
    sourceRow: m.sourceRow,
    crosswalkRow: m.crosswalkRow,
    brandSheetRow: m.brandSheetRow,
  };
}

/** Materials used by 2 or more brands. */
export async function multiBrandIds(): Promise<string[]> {
  const g = await prisma.materialBrandUsage.groupBy({
    by: ['materialId'],
    where: { usage: 'used' },
    having: { materialId: { _count: { gte: 2 } } },
  });
  return g.map((r) => r.materialId);
}

const findRows = async (where: Prisma.MaterialWhereInput, skip?: number, take?: number) =>
  (await prisma.material.findMany({ where, include: rowInclude, orderBy: { sourceRow: 'asc' }, skip, take })).map(toRow);

/** One page of the list for a filter, plus the options its selects need. */
export async function listMaterials(f: MaterialFilter) {
  const where = materialWhere(f, f.br === 'multi' ? await multiBrandIds() : []);
  const total = await prisma.material.count({ where });
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(f.page, pages);
  const [rows, p1] = await Promise.all([
    findRows(where, (page - 1) * PER_PAGE, PER_PAGE),
    prisma.material.groupBy({
      by: ['primaryCategory'],
      where: f.grp ? dbFilters.materialGroup(f.grp) : {},
      orderBy: { primaryCategory: 'asc' },
    }),
  ]);
  return { rows, total, page, primaryOptions: p1.map((r) => r.primaryCategory).filter((x): x is string => !!x) };
}

/** Semi-finished items made by the central kitchen (SM, incl. "คงไว้เป็น SM"). */
export const smMaterials = () => findRows(dbFilters.materialGroup('SM'));

export type ReviewTab = 'decide' | 'move' | 'check';
const reviewWhere: Record<ReviewTab, Prisma.MaterialWhereInput> = {
  decide: { mappingStatus: MATERIAL_MAPPING_STATUS.decide },
  move: { mappingStatus: MATERIAL_MAPPING_STATUS.move },
  check: { crosswalkFlag: 'ต้องตรวจสอบ' },
};

export async function reviewMaterials(tab: ReviewTab) {
  const [rows, decide, move, check] = await Promise.all([
    findRows(reviewWhere[tab]),
    prisma.material.count({ where: reviewWhere.decide }),
    prisma.material.count({ where: reviewWhere.move }),
    prisma.material.count({ where: reviewWhere.check }),
  ]);
  return { rows, counts: { decide, move, check } };
}

const changedWhere: Prisma.MaterialWhereInput = { code: { not: { equals: prisma.material.fields.legacyCode } } };

/** Materials whose ID changed (legacy ID kept for tracing). */
export async function changedIds(pageWanted: number) {
  const [total, all] = await Promise.all([prisma.material.count({ where: changedWhere }), prisma.material.count()]);
  const page = Math.min(Math.max(1, pageWanted), Math.max(1, Math.ceil(total / PER_PAGE)));
  const rows = await findRows(changedWhere, (page - 1) * PER_PAGE, PER_PAGE);
  return { rows, total, all, page };
}

/** Counts for the left menu. */
export async function navCounts() {
  const [active, sm, decide, changed] = await Promise.all([
    prisma.material.count({ where: dbFilters.activeMaterials }),
    prisma.material.count({ where: dbFilters.materialGroup('SM') }),
    prisma.material.count({ where: reviewWhere.decide }),
    prisma.material.count({ where: changedWhere }),
  ]);
  return { active, sm, decide, changed };
}

/** Active materials, slim: enough for the overview, brand, category and unit summaries (≈1,200 rows). */
export async function activeSummary() {
  const rows = await prisma.material.findMany({
    where: dbFilters.activeMaterials,
    select: {
      group: true,
      mappingStatus: true,
      primaryCategory: true,
      bibleCode: true,
      unitLabel: true,
      unit: { select: { code: true, nameTh: true } },
      brandUsages: { where: { usage: 'used' }, select: { brand: { select: { code: true } } } },
    },
  });
  return rows.map((m) => ({
    group: groupOf(m),
    primary: m.primaryCategory,
    bibleCode: m.bibleCode,
    unitLabel: m.unitLabel,
    unitCode: m.unit?.code ?? null,
    unitName: m.unit?.nameTh ?? null,
    brands: m.brandUsages.map((u) => u.brand.code),
  }));
}
export type ActiveSummary = Awaited<ReturnType<typeof activeSummary>>;

/** Overview numbers. */
export async function overviewData() {
  const [summary, all, decide, check, levels] = await Promise.all([
    activeSummary(),
    prisma.material.count(),
    prisma.material.count({ where: reviewWhere.decide }),
    prisma.material.count({ where: reviewWhere.check }),
    prisma.materialCategory.groupBy({ by: ['level'], _count: true }),
  ]);
  const level = (n: number) => levels.find((l) => l.level === n)?._count ?? 0;
  return { summary, all, decide, check, bibleLevels: [level(1), level(2), level(3)] as const };
}

/** The Bible tree in sheet order. */
export const bibleTree = () =>
  prisma.materialCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { code: true, level: true, group: true, primaryCode: true, secondaryCode: true, tertiaryCode: true, nameTh: true },
  });
