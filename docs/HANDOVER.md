# TKG Master Data — handover

For whoever picks this project up next: a new Claude account, a new developer, or a new Claude Code session on another
machine. State as of **12 November 2026**, `main` at `871c402` (PR #6).

Read in this order: this file → `CLAUDE.md` (rules, binding for every session) → `IMPLEMENTATION-CONTEXT.md` (business
context and data rules, Thai) → `docs/DECISIONS.md` → `docs/AGENTS.md` → `tests/e2e/FINDINGS.md`.

## 1. What this is

One central register for the master data of ต้นเครื่อง group's four brands: TK (ต้นเครื่อง), HK (หางเครื่อง),
NT (NONNA TWIST), OK (อุ่นเครื่อง). Two modules in an ICW OS–style web app:

- **Materials**: raw materials (RM), supplies (SP), semi-finished (SM); category tree (Bible); units; which brand uses what.
- **SKU (Selling)**: menu items per brand and store, with POS code mappings.

Source data are two Excel workbooks. They are imported into Postgres as **drafts**. Nothing is approved yet.

## 2. Where things live

| What | Where | Note for a new account |
|---|---|---|
| Code | GitHub `khundear/TKG-Master-Data` (private), branch `main` | The owner must invite the new GitHub account as a collaborator. |
| Source data | `Data/*.xlsx` — **not in git** (business data, D-005) | Copy both files by hand: `TKG Material Master Data (All Aspect) - Working Sheet.xlsx` and `Selling SKU Master Data — TK + HK + NT + OK.xlsx`. |
| Design reference | `github.com/ICW-AI/ICW-OS-DESIGN` (read-only) | Needs access in the ICW-AI organisation. Never edit, commit or push there. |
| Approved screen reference | `prototype/index.html` (in the repo) | Run with `python3 -I tools/export_data.py`, then serve `prototype/` (README). |
| CEO progress page | Claude artifact, private to the current owner's Claude account | A new account cannot open it. Ask the owner to share it, or rebuild it from the running app (section 8). |
| Prototype copy | Claude artifact linked in README | Same: private to the current account. |

**Repos that must never be touched:** `ICW-AI/ICW-OS-APP` and `ICW-AI/icw-clients` (do not clone, read, branch or push).
ICW conventions come only from ICW-OS-DESIGN's docs (`PLATFORM.md`, `Apps/UI-STANDARDS.md`, `CLAUDE.md`).
Nothing from the old POC folder is used.

## 3. Set up on a new machine

Needs: Node.js 20+ (built with 24), pnpm 10 via `corepack enable`, PostgreSQL 16 (Postgres.app on macOS is fine).

```bash
git clone git@github.com:khundear/TKG-Master-Data.git
cd TKG-Master-Data
mkdir Data            # copy the two .xlsx files in here
cp .env.example .env  # set DATABASE_URL (your DB user) and TKG_DATA_DIR (absolute path to Data/)
createdb tkg_master_data
corepack enable
pnpm install
pnpm db:migrate       # creates the tables
pnpm db:import        # imports both workbooks as draft (safe to re-run)
pnpm test             # 48 unit/data tests: db 23, i18n 4, materials 16, sku 5
pnpm check:i18n       # every Thai string has English
pnpm dev              # http://localhost:3000
```

Production build: `pnpm build`, then in `apps/web`: `npx dotenv -e ../../.env -- npx next start --port 3000`.
Page smoke test (app must be running): `node --test tests/e2e/smoke.test.mjs` (6 checks).

Expected import counts: materials 1,194 (1,192 active, 109 with a changed ID), categories 21 · 101 · 22, units 15,
brand usages 1,567 (TK 597 · HK 404 · NT 367 · OK 199); SKUs 2,418 (TK 704 · HK 1,007 · NT 402 · OK 305),
พร้อมขาย 2,375 / งดขายชั่วคราว 43, POS mappings 2,418. The tests fail if these drift.

Gotchas:
- Prisma refuses `migrate reset` when run by Claude Code. Don't work around it. Use a fresh database or schema instead.
- Python: always `python3 -I`. `tools/export_data.py` uses only the standard library.
- `apps/web/lib/locale.server.ts` reads the language cookie through Next's internal request store
  (`next/dist/server/app-render/work-unit-async-storage.external`). Re-check it when upgrading Next (pinned 15.5.28).

## 4. How the code is laid out

```
apps/web/            Next.js 15 App Router — the one deployable. Launcher at /, modules under app/(modules)/
packages/db/         Prisma schema + migrations, Excel importer (no openpyxl; fflate + fast-xml-parser), data tests, shared filters
packages/ui/         Shell from the prototype: top bar (with TH/EN switch), left menu, cards, table, drawer…
packages/i18n/       _t(): the Thai string is the key; English in catalogs; locale from the tkg-locale cookie
modules/materials/   Materials pages, queries, tests, English catalog, SPEC.md
modules/sku-selling/ SKU pages, queries, tests, English catalog, SPEC.md
tests/e2e/           QA findings and the no-dependency smoke test
tools/               export_data.py (prototype data), check-i18n.mjs
```

Stack: TypeScript, pnpm + Turborepo, Next.js 15.5 / React 19.1, Prisma 6 + PostgreSQL 16, Vitest 3 (D-002, D-006).
Every record carries `status` (draft / approved / retired) and provenance (`importBatchId`, `sourceSheet`,
`sourceRow`); raw rows are kept in `import_rows`.

## 5. Rules that must not be broken

From `CLAUDE.md` and the owner's standing instructions:

1. **UI follows ICW-OS-DESIGN**, look and structure: launcher → module with left menu. Light theme, action blue
   `#0A66D6`, cards radius 12, controls 8. The old CEO wireframe and old TKG CI colours are retired; only the logo in
   `CI/` is TKG brand.
2. Every user-visible Thai string goes through `_t()`; English lives in the catalogs.
3. Brand flag FALSE/0 = **not specified**, never "not allowed".
4. Pork is a **filter** on Materials, never its own menu.
5. Never show sheet counts as approved; imported data is draft until approved.
6. POS codes are **mappings** to the TKG ID, never a replacement for it.
7. Keep legacy Material IDs (109 changed) for traceability.
8. **SKU data is not final.** Do not cleanse or restructure it until the owner says so.
9. Git: one branch and one PR per piece of work, branched from `main`. Commit or push only when the owner asks.
10. The owner is not a developer: explain in plain language, and ask before anything outward-facing (push, PR, sharing).

## 6. What has been done

| PR | What |
|---|---|
| #1 | Foundation: monorepo, Prisma schema, Excel importer, shared UI and i18n, data tests |
| #2 | Materials module: overview, list, purchase items, made in-house, by brand, categories, units, review, old–new IDs, approvals, import/export, history, settings |
| #3 | SKU (Selling) module: overview, list, stores, POS codes, central and brand categories, missing data, paused, approvals, import/export, history, settings |
| #4 | QA fixes: TH/EN switch; pork filter no longer matches spare parts (42 → 41) |
| #5 | QA fix: SKU "รหัส TKG" column relabelled "รหัสอ้างอิงชั่วคราว" (it is brand + POS ID until TKG codes exist) |
| #6 | QA findings report and smoke test |

Approval, request, import/export, history and settings screens exist as placeholders ("ยังไม่เปิดใช้"). Their workflow
and tables are not built yet (D-007).

## 7. What is open

**Small polish from QA** (`tests/e2e/FINDINGS.md` 4–9):
- SKU placeholder pages say "ในต้นแบบนี้"; use the Materials wording.
- Module name hidden in the top bar at phone width.
- Opening a record doesn't change the URL, so it can't be linked.
- Unknown `status` value empties the SKU list.
- The i18n check misses non-literal keys; brands have no English names.
- SKU module lacks DB-backed count tests.

**Not built yet** (IMPLEMENTATION-CONTEXT §4):
- Multi-brand AND/OR filter on Materials.
- Pork part-proposal status with reasons.
- Store filter on the SKU list.
- A retention rule for `import_rows`.

**Waiting on the owner / business decisions** (IMPLEMENTATION-CONTEXT §10, DECISIONS "Open"):
- Where to host a pilot, who gets access, sign-in (SSO), backups.
- Owners and approvers per data type: needed before any record can become approved.
- TKG Material/SKU code format and UUID policy.
- When SKU data is final, so it can be cleansed and restructured.
- Revisions, change requests and the approval workflow (schema not built, D-007).

## 8. How the work was organised (Claude Code)

The build was split into parallel Claude Code sessions, each in its own git worktree under `.claude/worktrees/`:
Data/DB (owns `packages/`, `apps/web` scaffold, root configs), Materials (`modules/materials`,
`apps/web/app/(modules)/materials`), SKU (`modules/sku-selling`, `apps/web/app/(modules)/sku`), and QA (`tests/e2e/`,
findings only). See `docs/AGENTS.md`. Shared files (`packages/db/schema.prisma`, root configs) change only in the
Data/DB session.

Sessions, side-session notes, Claude memory and artifacts belong to the old Claude account and do not move with it.
Everything needed to continue is in this repo. The account-level memory held these standing rules, now in section 5:
- ICW-OS-DESIGN is read-only.
- TKG UI follows ICW-OS-DESIGN in look and structure.
- SKU data is not final.
- Build only in this standalone repo, never in ICW-OS-APP or icw-clients.

**To rebuild the CEO screenshots:**
1. Run the production build (section 3).
2. Capture `/`, the `/materials/*` pages and the `/sku/*` pages at 1440 px.
3. Set the cookie `tkg-locale=en` for English shots.

**Suggested first prompt for a new Claude Code session:**

> Read `docs/HANDOVER.md`, `CLAUDE.md`, `IMPLEMENTATION-CONTEXT.md` and `docs/DECISIONS.md`. Set up the project per
> HANDOVER section 3 and confirm the counts. Then tell me, in plain language, what's open and what you suggest next.
> Don't push or open PRs without asking.
