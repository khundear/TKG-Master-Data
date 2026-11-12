# QA findings — combined app (Materials + SKU Selling)

Session 3 (QA), 12 Nov 2026. Tested `main` at 93b56c3 (PR #1 foundation, PR #2 Materials, PR #3 SKU) on this Mac,
Postgres.app `tkg_master_data`, dev server `pnpm dev` on port 3000, built-in browser. No app code was changed.

**Verdict: no blocking problems.** Every page loads, every number matches the prototype and the sheets, the data rules
hold in the database and on screen, phone width has no sideways scrolling, and there are no console or server errors.
Three medium findings and a handful of small ones are below.

Severity: **High** = wrong data or broken page · **Medium** = breaks a house rule or misleads a reader · **Low** = polish.
"Owner" is the session that should fix it. Shared shell / `packages/ui` / `apps/web` scaffold / `packages/db` belong to the
Data-DB session (`docs/AGENTS.md`).

## Findings

| # | Sev | Route | What is wrong | Expected | Actual | Owner |
|---|---|---|---|---|---|---|
| 1 | Medium | every page | There is no way to switch the app to English. `setLocale()` is never called, the top bar has no TH/EN switch, `<html lang="th">` is fixed. | A TH/EN switch (ICW convention), so the English catalogs are used and can be checked. | English catalogs exist and `pnpm check:i18n` passes, but no user can ever see English, and English mode cannot be tested. | UI (Data-DB) |
| 2 | Medium | `/sku/list`, `/sku/pos`, `/sku/paused`, SKU drawer | The column called **รหัส TKG** shows the Master Record Key, which is the brand plus the POS Internal ID for all 2,418 SKUs (e.g. `NT:47229499`). On `/sku/pos` it reads `NT:47229499 ↔ 47229499`, so the "TKG code" is really the POS number. Same as the prototype. | Rule: POS codes are mappings and never replace the TKG ID. Until TKG codes are allocated, the column should say what it is (e.g. "Master Record Key") so nobody hands it to POS or BOM as the permanent code. | The drawer correctly says "รหัส TKG ถาวร · ยังไม่ออกรหัส", but list headers, search hint and POS page call the POS-based key "รหัส TKG". | SKU (label); TKG code format is a user decision |
| 3 | Medium | `/materials/list?pork=1` | The **มีหมู** filter matches words in the name, so it lists non-food items: `CS_OTHERS_0014` สปริง เครื่องสไลด์หมู 14 นิ้ว (a slicer spring), and `RM_OTHERS_0007` ผงปรุงรสหมู (seasoning). 42 results = 27 in sub-category PORK + 15 by name. | Pork filter shows pork materials only (IMPLEMENTATION-CONTEXT §3: name grouping is not certified). At least exclude group SP, or label the result "ข้อเสนอ · รอตรวจ". | A machine spare part shows up as pork. | Data-DB (`porkMaterials` in `packages/db/src/filters.ts`) |
| 4 | Low | `/sku/approve`, `/sku/io`, `/sku/log`, `/sku/config` | Placeholder text says "ยังไม่เปิดใช้**ในต้นแบบนี้**" ("…in this prototype"). | The app is not the prototype. Materials already says "ยังไม่เปิดใช้ · อยู่ในระยะถัดไป"; use the same. | Two different wordings for the same state, one of them wrong. | SKU |
| 5 | Low | all `/sku` pages at 375 px | Top bar cuts the module name to "SKU (S…". | Full name, or a short form that fits. | Truncated. | UI (Data-DB) |
| 6 | Low | `/materials/list`, `/sku/list`, `/sku/paused`, `/materials/sm` | Opening a row's drawer does not change the URL. | A record can be linked, shared, reopened with Back. | Drawer cannot be opened from a link (also noted in the morning status). | Materials + SKU (or a shared `?id=` pattern in UI) |
| 7 | Low | `/sku/list?status=x` | An unknown status value empties the list ("ไม่พบ SKU"). | Ignore unknown values like the other filters do (`br=ZZ`, `gap=zzz`, bad `page` all fall back). | Empty list. Only reachable by editing the URL. | SKU |
| 8 | Low | — (`tools/check-i18n.mjs`) | The i18n check only sees literal `_t('…')`. Keys passed as variables (e.g. `_t(label)`) and data shown as-is are not checked. Brands have `nameEn = null`, so brand names (ต้นเครื่อง, หางเครื่อง, อุ่นเครื่อง) would stay Thai in English mode. | Check also covers label tables; brands get English names (or a decision that brand names stay Thai). | Hidden until finding 1 is fixed. I checked the status labels by hand: all have English. | Data-DB |
| 9 | Low | — | SKU module has 5 unit tests (URL parameters only) and no database-backed count tests. Materials has 16 incl. counts. | SKU counts (2,418 / 2,375 / 43, per brand) guarded by a module test. | Only `packages/db` data tests and the new smoke test cover them. | SKU |

## Not built yet (listed in IMPLEMENTATION-CONTEXT §4, not in the module SPECs or the prototype)

These are not bugs in what was asked for; they are gaps for the user to schedule.

- Materials list: choose **several** brands with OR / AND. Today: one brand pill at a time (+ "ใช้ร่วม 2+", "ยังไม่ระบุ").
- PORK: part-proposal filter with "รอตรวจ" status and reason in the drawer. Today: only the มีหมู filter (finding 3).
- SKU list: filter by store. Today one store per brand, so `/sku/stores` covers it.
- `import_rows` keeps every run's raw rows (8 batches, ~8,900 rows per `pnpm db:import`). By design (D-009, history),
  but it will grow; a retention rule is worth deciding before imports run often. Owner: Data-DB.

## What was checked and passed

### Setup (README order)

| Step | Result |
|---|---|
| `git fetch`, branch at `origin/main` 93b56c3 | ok, nothing to reset |
| `.env` copied from the Data-DB worktree | ok |
| `pnpm install` | ok |
| `pnpm db:migrate` | ok, no new migration |
| `pnpm db:import` | ok: materials 1,194 (2 cancelled), categories 144, units 15, brand usages 1,567; SKUs 2,418, POS mappings 2,418, POS rows without SKU 0, stores 4, SKU categories 175, brand menu categories 202 — all draft |
| `pnpm test` | ok: db 23, i18n 4, materials 16, sku-selling 5 |
| `pnpm typecheck` | ok |
| `pnpm check:i18n` | ok ("every _t() key has English") |
| `pnpm build` | ok, all 26 module routes + `/` + `/ui-kit`, no warnings |

### Routes

All 26 module routes + `/` + `/ui-kit` answer 200; `/nope` gives 404. Headings, left menus, column headers, filters,
metric cards and counts were compared with `prototype/index.html` (`#mat…`, `#sku…`): they match, apart from the
differences the Materials session documented on purpose (category tree 21 · 101 · 22 per D-011, "กึ่งสำเร็จรูป",
"ที่มา" section in the drawer, placeholder wording).

### Data rules (database and screens)

| Rule | Database | Screen |
|---|---|---|
| Brand flag 0 = not specified | `material_brand_usages` holds only `used` rows (1,567); no "not allowed" value exists | Dashed chips, "ช่องที่เป็นเส้นประ = ยังไม่ระบุ ไม่ใช่ห้ามใช้"; overview "(ไม่ใช่ห้ามใช้)"; no "ห้ามใช้/ไม่อนุญาต" used as a value anywhere |
| Pork is a filter only | — | No pork menu item in either module; มีหมู pill on the list (see finding 3) |
| No count labelled approved | every row in materials, categories, brand usages, SKUs, POS mappings is `draft` | No "อนุมัติแล้ว"/"Approved" on any page; "ข้อมูลร่าง · รออนุมัติ" badge on every module page; launcher note says draft |
| POS codes are mappings | `tkg_code` empty for all 2,418; POS IDs live in `pos_mappings` | Drawer and `/sku/pos` show "↔" and "รหัส POS เป็นการจับคู่ ไม่ใช่รหัสของรายการ" (but see finding 2) |
| Legacy IDs kept (109 changed) | 109 with `code <> legacy_code` | `/materials/ids` "109 จาก 1,194"; list shows "เดิม BV_SODA_0001" under the new code; searching the old code finds the item |
| SKU data not cleansed | Fields stored as in the sheet (cells trimmed only); SKU Category Code empty for 2,418; TKG code not invented | Gaps page shows the raw gaps (2,418 · 160 · 959 · 4 · 2) |

Counts: materials 1,194 (1,192 active; RM 963 · SP 220 · SM 9); brand usage TK 597 · HK 404 · NT 367 · OK 199; shared 2+
362; no brand 148; SKUs 2,418 (TK 704 · HK 1,007 · NT 402 · OK 305); พร้อมขาย 2,375 / งดขายชั่วคราว 43 (TK 2 · HK 0 ·
NT 6 · OK 35). All match `IMPLEMENTATION-CONTEXT.md` and the prototype.

### Interaction, phone width, console

- Materials list: brand pills, group / category / status selects, มีหมู, search (incl. legacy ID), pager (page 2 of 24),
  row → drawer, Escape closes, drawer buttons go to the placeholder pages.
- SKU list: brand + status filters from the URL, POS-ID search, row → drawer with POS mapping; gaps page links to the
  filtered list; paused page.
- Out-of-range page numbers clamp; unknown filter values fall back (except finding 7).
- 375 px: all 29 pages have no horizontal page overflow; the left menu opens from ☰ and closes after choosing; the drawer
  fills the screen. Wide tables show their first columns and scroll inside the card.
- No console errors in the browser and no server errors during the whole run.

### Not covered

- English mode (impossible today, finding 1).
- Production server (`next start`) in the browser — only the build was checked.
- Real phones, screen readers, keyboard-only use beyond Escape.

## Automated smoke test

`tests/e2e/smoke.test.mjs` — no new dependencies (Node's test runner + fetch). With the app running:

```bash
node --test tests/e2e/smoke.test.mjs
```

It checks every route returns 200, the draft badge, no "approved" wording, the key counts, legacy-ID search, POS mapping
wording, and that bad URL values don't break pages. 6 tests, all pass on 93b56c3.
