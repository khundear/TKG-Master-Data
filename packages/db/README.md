# @tkg/db

The one Prisma schema, migrations, the Excel importer, the seed and the data tests (owned by the Data / DB session,
docs/AGENTS.md). Module sessions **read** from here; a schema change is asked for, not made in a module.

```ts
import { prisma, filters, POS_SALES_STATUS, MATERIAL_MAPPING_STATUS } from '@tkg/db';

await prisma.material.findMany({ where: { AND: [filters.activeMaterials, filters.porkMaterials] } }); // มีหมู
await prisma.material.count({ where: filters.usedByBrand('TK') });                                  // 597
await prisma.posMapping.count({ where: { salesStatus: POS_SALES_STATUS.paused } });                  // 43
```

| File | What |
|---|---|
| `prisma/schema.prisma` | Tables and the rules they carry (draft status, provenance, brand flag 0 = no row). |
| `src/xlsx.ts` | Small .xlsx reader (TypeScript port of the one in `tools/export_data.py`). |
| `src/mapping.ts` | Sheet → record mapping. Same sheets, rows and columns as `tools/export_data.py`; keep them in step. |
| `src/import.ts` | `pnpm db:import`: loads both workbooks from `$TKG_DATA_DIR` as draft data. |
| `src/seed.ts` | `pnpm db:seed`: the 4 brands. |
| `src/filters.ts` | Shared `where` helpers: active materials, มีหมู, used by brand, no brand specified, group (SM incl. คงไว้เป็น SM). |
| `test/` | `mapping.test.ts` (no DB) and `data.test.ts` (after an import: counts and rules). |

## Tables

| Table | Rows today | Source |
|---|---:|---|
| `brands` | 4 | seed |
| `material_categories` | 144 (21 · 101 · 22) | Material Master Bible, rows 16 → "REVIEW QUEUE" |
| `units` | 15 | unit column of Meterials (All Brands), `CODE - name` labels only |
| `materials` | 1,194 (2 cancelled, 109 changed IDs) | Material Mapping (Excel) + Material ID Crosswalk + Meterials (All Brands) |
| `material_brand_usages` | 1,567 (TK 597 · HK 404 · NT 367 · OK 199) | brand flags = 1 only |
| `sku_categories` | 175 (L1 · L2 · 130 L3) | SKU Categories |
| `brand_menu_categories` | 202 | Brand Menu Categories |
| `selling_skus` | 2,418 (TK 704 · HK 1,007 · NT 402 · OK 305) | Selling SKU Master |
| `stores` | 4 | store names in SKU–Store Mapping |
| `pos_mappings` | 2,418 (2,375 พร้อมขาย · 43 งดขายชั่วคราว) | SKU–Store Mapping |
| `import_batches`, `import_rows` | one batch per workbook per import | every source row as raw JSON, keyed by column letter |

All imported rows are `status = draft`. See docs/DECISIONS.md D-007 … D-011.
