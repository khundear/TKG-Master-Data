// Sheet → record mapping for the two TKG workbooks. Pure functions, no database.
// Column positions are the ones documented and used in tools/export_data.py; keep the two in step.
import { Workbook, colLetter, type Row, type Rows } from './xlsx';

export const MAPPING_VERSION = 'export_data.py/2026-11-11';
export const MATERIAL_FILE = 'TKG Material Master Data (All Aspect) - Working Sheet.xlsx';
export const SKU_FILE = 'Selling SKU Master Data — TK + HK + NT + OK.xlsx';
export const BRAND_CODES = ['TK', 'HK', 'NT', 'OK'] as const;
export type BrandCode = (typeof BRAND_CODES)[number];

export const SHEETS = {
  materialMapping: 'Material Mapping (Excel)',
  crosswalk: 'Material ID Crosswalk',
  allBrands: 'Meterials (All Brands)', // spelled as in the source
  bible: 'Material Master Bible',
  skuMaster: 'Selling SKU Master',
  storeMapping: 'SKU–Store Mapping',
  skuCategories: 'SKU Categories',
  brandMenuCategories: 'Brand Menu Categories',
} as const;

/** Material status value that means the material is cancelled. */
export const CANCELLED = 'ยกเลิก';

// ---------------------------------------------------------------- helpers (same behaviour as export_data.py)

/** Trimmed string, or null when empty. */
export function s(x: string | undefined): string | null {
  const v = (x ?? '').trim();
  return v === '' ? null : v;
}
export function num(x: string | undefined): number | null {
  if (x == null || x.trim() === '') return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}
/** Sheet brand flag. 1 / TRUE = used. Anything else (0, FALSE, empty) = not specified — never "not allowed". */
export function flag(x: string | undefined): boolean {
  return ['1', '1.0', 'TRUE'].includes((x ?? '').trim());
}
/** Numeric IDs stored as floats ("47229499.0") back to their digits. */
export function intString(x: string | undefined): string | null {
  const v = s(x);
  return v == null ? null : v.replace(/^(-?\d+)\.0+$/, '$1');
}
/** ISO date string or Excel serial date → Date (UTC midnight). */
export function sheetDate(x: string | undefined): Date | null {
  const v = s(x);
  if (v == null) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return new Date(`${v.slice(0, 10)}T00:00:00Z`);
  const n = Number(v);
  if (Number.isFinite(n) && n > 20000 && n < 80000) return new Date(Date.UTC(1899, 11, 30) + Math.round(n) * 86400000);
  return null;
}
/** A row as JSON keyed by column letter, for import_rows.raw. */
export function rawRow(row: Row): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [i, v] of [...row.entries()].sort((a, b) => a[0] - b[0])) out[colLetter(i)] = v;
  return out;
}
/** "EA - ชิ้น" → { code: 'EA', nameTh: 'ชิ้น' }. Anything else is not a unit code and stays a label only. */
export function parseUnit(label: string | null): { code: string; nameTh: string } | null {
  if (!label) return null;
  const m = /^([A-Z0-9]+)\s+-\s+(.+)$/.exec(label.trim());
  return m ? { code: m[1]!, nameTh: m[2]!.trim() } : null;
}

const sorted = (rows: Rows) => [...rows.entries()].sort((a, b) => a[0] - b[0]);

export interface SourceRef {
  sheet: string;
  row: number;
}
export interface RawSheetRow extends SourceRef {
  raw: Record<string, string>;
}

// ---------------------------------------------------------------- materials

export interface MaterialRecord {
  code: string;
  legacyCode: string;
  idChange: string | null;
  name: string;
  description: string | null;
  kind: string | null;
  group: string | null;
  primaryCategory: string | null;
  secondaryCategory: string | null;
  tertiaryCategory: string | null;
  proposedCategoryCode: string | null;
  proposedCategoryNameTh: string | null;
  currentCategoryName: string | null;
  currentCategoryCode: string | null;
  bibleCode: string | null;
  mappingStatus: string;
  isCancelled: boolean;
  mappingNote: string | null;
  crosswalkFlag: string | null;
  crosswalkEvidence: string | null;
  unitLabel: string | null;
  storageTemperature: string | null;
  brands: BrandCode[];
  source: SourceRef;
  crosswalkRow: number | null;
  brandSheetRow: number | null;
}

export interface MaterialCategoryRecord {
  code: string;
  level: number;
  group: string;
  primaryCode: string | null;
  secondaryCode: string | null;
  tertiaryCode: string | null;
  nameTh: string | null;
  parentCode: string | null;
  sortOrder: number;
  sheetClassified: number | null;
  sheetPending: number | null;
  source: SourceRef;
}

export interface MaterialWorkbook {
  materials: MaterialRecord[];
  categories: MaterialCategoryRecord[];
  raw: RawSheetRow[];
}

export function readMaterialWorkbook(path: string): MaterialWorkbook {
  const wb = new Workbook(path);
  const raw: RawSheetRow[] = [];
  const keep = (sheet: string, row: number, r: Row) => raw.push({ sheet, row, raw: rawRow(r) });

  // Material ID Crosswalk, row 5+: B legacy ID, C current ID, E change, J Bible code, K flag, L evidence
  const crosswalk = new Map<string, { row: number; v: Row }>();
  for (const [r, v] of sorted(wb.rows(SHEETS.crosswalk))) {
    if (r < 5 || !v.get(1)) continue;
    crosswalk.set(s(v.get(1))!, { row: r, v });
    keep(SHEETS.crosswalk, r, v);
  }
  // Meterials (All Brands), row 12+: C legacy ID, J description, K kind, N–Q TK/HK/NT/OK, X unit, AS temperature
  const allBrands = new Map<string, { row: number; v: Row }>();
  for (const [r, v] of sorted(wb.rows(SHEETS.allBrands))) {
    if (r < 12 || !v.get(2)) continue;
    allBrands.set(s(v.get(2))!, { row: r, v });
    keep(SHEETS.allBrands, r, v);
  }

  // Material Mapping (Excel), row 9+: one row per material
  const materials: MaterialRecord[] = [];
  for (const [r, v] of sorted(wb.rows(SHEETS.materialMapping))) {
    if (r < 9 || !v.get(1)) continue;
    keep(SHEETS.materialMapping, r, v);
    const legacy = s(v.get(1))!;
    const c = crosswalk.get(legacy);
    const a = allBrands.get(legacy);
    const cv = c?.v ?? new Map<number, string>();
    const av = a?.v ?? new Map<number, string>();
    const status = s(v.get(11)) ?? '';
    materials.push({
      code: s(cv.get(2)) ?? legacy,
      legacyCode: legacy,
      idChange: s(cv.get(4)),
      name: s(v.get(2)) ?? '',
      currentCategoryName: s(v.get(3)),
      currentCategoryCode: s(v.get(4)),
      proposedCategoryCode: s(v.get(5)),
      group: s(v.get(6)),
      primaryCategory: s(v.get(7)),
      secondaryCategory: s(v.get(8)),
      tertiaryCategory: s(v.get(9)),
      proposedCategoryNameTh: s(v.get(10)),
      mappingStatus: status,
      isCancelled: status === CANCELLED,
      mappingNote: s(v.get(12)),
      bibleCode: s(cv.get(9)),
      crosswalkFlag: s(cv.get(10)),
      crosswalkEvidence: s(cv.get(11)),
      description: s(av.get(9)),
      kind: s(av.get(10)),
      unitLabel: s(av.get(23)),
      storageTemperature: s(av.get(44)),
      brands: BRAND_CODES.filter((_, i) => flag(av.get(13 + i))),
      source: { sheet: SHEETS.materialMapping, row: r },
      crosswalkRow: c?.row ?? null,
      brandSheetRow: a?.row ?? null,
    });
  }

  // Material Master Bible, row 16+. The tree ends where the sheet's second table ("REVIEW QUEUE") starts.
  // B group, C primary, D secondary, E name TH (1/2), F tertiary, G name TH (3), H category ID, I level, J/K counts
  const categories: MaterialCategoryRecord[] = [];
  const lastAt: Record<number, string> = {};
  for (const [r, v] of sorted(wb.rows(SHEETS.bible))) {
    if (r < 16) continue;
    keep(SHEETS.bible, r, v);
    if ((v.get(1) ?? '').startsWith('REVIEW QUEUE')) break;
    const code = s(v.get(7));
    const level = num(v.get(8));
    if (!code || level == null || level < 1 || level > 3) continue;
    lastAt[level] = code;
    categories.push({
      code,
      level,
      group: s(v.get(1)) ?? '',
      primaryCode: s(v.get(2)),
      secondaryCode: s(v.get(3)),
      tertiaryCode: s(v.get(5)),
      nameTh: level === 3 ? s(v.get(6)) : s(v.get(4)),
      parentCode: level > 1 ? (lastAt[level - 1] ?? null) : null,
      sortOrder: categories.length + 1,
      sheetClassified: num(v.get(9)),
      sheetPending: num(v.get(10)),
      source: { sheet: SHEETS.bible, row: r },
    });
  }
  return { materials, categories, raw };
}

// ---------------------------------------------------------------- SKU (Selling)

export interface SkuRecord {
  masterRecordKey: string;
  brand: string;
  nameEn: string | null;
  nameTh: string | null;
  l1: string | null;
  l2En: string | null;
  l2Th: string | null;
  l3En: string | null;
  l3Th: string | null;
  categoryCode: string | null;
  brandMenuCategory: string | null;
  brandMenuSubcategory: string | null;
  reviewNote: string | null;
  sheetBrandFlags: BrandCode[];
  source: SourceRef;
}

export interface PosRecord {
  masterRecordKey: string;
  brand: string | null;
  store: string | null;
  posSkuCode: string | null;
  posInternalId: string | null;
  posLabel: string | null;
  posGroup: string | null;
  posCategory: string | null;
  price: number | null;
  salesStatus: string | null;
  presentInPos: boolean | null;
  readyToSell: boolean | null;
  snapshotDate: Date | null;
  sourceUrl: string | null;
  source: SourceRef;
}

export interface SkuCategoryRecord {
  code: string;
  level: number;
  nameEn: string | null;
  nameTh: string | null;
  parentCode: string | null;
  sortOrder: number;
  source: SourceRef;
}

export interface BrandMenuCategoryRecord {
  brand: string;
  type: string | null;
  menuCategory: string | null;
  categoryFull: string | null;
  subcategory: string | null;
  subcategoryFull: string | null;
  prefix: string | null;
  sortOrder: number;
  source: SourceRef;
}

export interface SkuWorkbook {
  skus: SkuRecord[];
  pos: PosRecord[];
  categories: SkuCategoryRecord[];
  brandMenuCategories: BrandMenuCategoryRecord[];
  raw: RawSheetRow[];
}

const bool01 = (x: string | undefined): boolean | null => {
  const v = s(x);
  return v == null ? null : flag(v);
};

export function readSkuWorkbook(path: string): SkuWorkbook {
  const wb = new Workbook(path);
  const raw: RawSheetRow[] = [];
  const keep = (sheet: string, row: number, r: Row) => raw.push({ sheet, row, raw: rawRow(r) });

  // Selling SKU Master, row 10+: C key, D–E names, F L1, G–H L2, I–J L3, K code, L–M brand menu, N notes, O–R flags
  const skus: SkuRecord[] = [];
  for (const [r, v] of sorted(wb.rows(SHEETS.skuMaster))) {
    if (r < 10 || !v.get(2)) continue;
    keep(SHEETS.skuMaster, r, v);
    const key = s(v.get(2))!;
    skus.push({
      masterRecordKey: key,
      brand: key.split(':')[0]!,
      nameEn: s(v.get(3)),
      nameTh: s(v.get(4)),
      l1: s(v.get(5)),
      l2En: s(v.get(6)),
      l2Th: s(v.get(7)),
      l3En: s(v.get(8)),
      l3Th: s(v.get(9)),
      categoryCode: s(v.get(10)),
      brandMenuCategory: s(v.get(11)),
      brandMenuSubcategory: s(v.get(12)),
      reviewNote: s(v.get(13)),
      sheetBrandFlags: BRAND_CODES.filter((_, i) => flag(v.get(14 + i))),
      source: { sheet: SHEETS.skuMaster, row: r },
    });
  }

  // SKU–Store Mapping, row 4+: A key, C brand, D store, E POS code, F POS ID, G label, H group, I category,
  // J price, K status, L present, M ready, N snapshot date, O source
  const pos: PosRecord[] = [];
  for (const [r, v] of sorted(wb.rows(SHEETS.storeMapping))) {
    if (r < 4 || !v.get(0)) continue;
    keep(SHEETS.storeMapping, r, v);
    pos.push({
      masterRecordKey: s(v.get(0))!,
      brand: s(v.get(2)),
      store: s(v.get(3)),
      posSkuCode: s(v.get(4)),
      posInternalId: intString(v.get(5)),
      posLabel: s(v.get(6)),
      posGroup: s(v.get(7)),
      posCategory: s(v.get(8)),
      price: num(v.get(9)),
      salesStatus: s(v.get(10)),
      presentInPos: bool01(v.get(11)),
      readyToSell: bool01(v.get(12)),
      snapshotDate: sheetDate(v.get(13)),
      sourceUrl: s(v.get(14)),
      source: { sheet: SHEETS.storeMapping, row: r },
    });
  }
  // A brand comes from the store mapping when there is one, else from the key prefix (as export_data.py does).
  const posBrand = new Map(pos.map((p) => [p.masterRecordKey, p.brand]));
  for (const sku of skus) sku.brand = posBrand.get(sku.masterRecordKey) ?? sku.brand;

  // SKU Categories, row 4+: A–C L1 code/EN/TH, D–F L2, G–I L3. One row per L3; L1 and L2 repeat.
  const categories: SkuCategoryRecord[] = [];
  const seen = new Set<string>();
  for (const [r, v] of sorted(wb.rows(SHEETS.skuCategories))) {
    if (r < 4 || !v.get(0)) continue;
    keep(SHEETS.skuCategories, r, v);
    const levels: [number, number][] = [
      [1, 0],
      [2, 3],
      [3, 6],
    ];
    let parent: string | null = null;
    for (const [level, col] of levels) {
      const code = s(v.get(col));
      if (!code) break;
      if (!seen.has(code)) {
        seen.add(code);
        categories.push({
          code,
          level,
          nameEn: s(v.get(col + 1)),
          nameTh: s(v.get(col + 2)),
          parentCode: parent,
          sortOrder: categories.length + 1,
          source: { sheet: SHEETS.skuCategories, row: r },
        });
      }
      parent = code;
    }
  }

  // Brand Menu Categories, row 4+: A brand, B type, C menu category, D full, E subcategory, F full, G prefix
  const brandMenuCategories: BrandMenuCategoryRecord[] = [];
  for (const [r, v] of sorted(wb.rows(SHEETS.brandMenuCategories))) {
    if (r < 4 || !v.get(0)) continue;
    keep(SHEETS.brandMenuCategories, r, v);
    brandMenuCategories.push({
      brand: s(v.get(0))!,
      type: s(v.get(1)),
      menuCategory: s(v.get(2)),
      categoryFull: s(v.get(3)),
      subcategory: s(v.get(4)),
      subcategoryFull: s(v.get(5)),
      prefix: s(v.get(6)),
      sortOrder: brandMenuCategories.length + 1,
      source: { sheet: SHEETS.brandMenuCategories, row: r },
    });
  }

  return { skus, pos, categories, brandMenuCategories, raw };
}
