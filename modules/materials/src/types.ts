/** One material as the list, the review pages and the detail drawer show it (serialisable: server → client). */
export interface MaterialRow {
  code: string;
  legacyCode: string;
  idChange: string | null;
  name: string;
  description: string | null;
  kind: string | null;
  /** RM / SP / SM ("คงไว้เป็น SM" counts as SM). */
  group: string;
  primary: string | null;
  secondary: string | null;
  tertiary: string | null;
  proposedCode: string | null;
  categoryTh: string | null;
  currentCategory: string | null;
  currentCategoryCode: string | null;
  bibleCode: string | null;
  mappingStatus: string;
  crosswalkFlag: string | null;
  note: string | null;
  unitLabel: string | null;
  unitName: string | null;
  temperature: string | null;
  /** Brands with a "used" row. A brand not listed is "not specified", never "not allowed". */
  brands: string[];
  status: string;
  sourceSheet: string;
  sourceRow: number;
  crosswalkRow: number | null;
  brandSheetRow: number | null;
}
