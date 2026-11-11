// Plain, serialisable shapes passed from server pages to client components.

/** How one store's POS knows the SKU (snapshot). A mapping to the Master Record Key, never the SKU's identity. */
export interface SkuMapping {
  id: string;
  store: string;
  posInternalId: string | null;
  posSkuCode: string | null;
  posLabel: string | null;
  posGroup: string | null;
  posCategory: string | null;
  price: number | null;
  /** POS Sales Status at snapshot time (พร้อมขาย · งดขายชั่วคราว). Not an approval. */
  salesStatus: string | null;
  snapshotDate: string | null;
}

export interface SkuRow {
  /** Master Record Key, e.g. NT:47229499 (the permanent TKG code is not allocated yet). */
  key: string;
  tkgCode: string | null;
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
  /** Record status: draft / approved / retired. Imported data is draft. */
  status: string;
  /** First store's POS snapshot status and price (one store per brand today). */
  salesStatus: string | null;
  price: number | null;
  mappings: SkuMapping[];
  sourceSheet: string;
  sourceRow: number;
}

export interface PosRow {
  id: string;
  key: string;
  posInternalId: string | null;
  posSkuCode: string | null;
  posLabel: string | null;
  posGroup: string | null;
  posCategory: string | null;
  store: string;
  sku: SkuRow;
}

export interface BrandStat {
  code: string;
  name: string;
  stores: string[];
  total: number;
  ready: number;
  paused: number;
}

export interface StoreStat {
  name: string;
  brand: string;
  brandName: string;
  total: number;
  ready: number;
  paused: number;
  avgPrice: number | null;
  snapshot: string | null;
}

export interface CategoryNode {
  code: string;
  level: number;
  nameEn: string | null;
  nameTh: string | null;
  count: number;
  /** The L2 Thai name the list filters on when this row is clicked (L2 and L3 rows). */
  l2Th: string | null;
}
