# TKG Master Data

The single source of truth for ต้นเครื่อง group (TK · HK · NT · OK) master data, built as two ICW OS–style modules:

| Module | What it holds | Source today |
|---|---|---|
| **Materials** (`modules/materials`) | Raw materials (RM), supplies (SP), semi-finished (SM), categories, units, brand usage | `Data/TKG Material Master Data (All Aspect) - Working Sheet.xlsx` |
| **SKU (Selling)** (`modules/sku-selling`) | Selling SKUs for 4 brands, central + brand menu categories, POS mapping per branch | `Data/Selling SKU Master Data — TK + HK + NT + OK.xlsx` |

This is a **standalone repo** (see [docs/DECISIONS.md](docs/DECISIONS.md) D-001). It follows the look, structure and
conventions of ICW OS but does not depend on, or touch, any ICW product repository.

## Where things are

```
README.md                 this file
docs/HANDOVER.md          state of the project and how to pick it up on a new account or machine
CLAUDE.md                 rules for every Claude Code session working here (read first)
IMPLEMENTATION-CONTEXT.md full business context and data rules (Thai)
docs/DECISIONS.md         decision log (D-001 …)
docs/AGENTS.md            how the build is split across sessions, who owns which folder
Data/                     source Excel files — NOT in git (business data)
CI/                       TKG logo
prototype/                approved clickable prototype (static HTML, real data)
tools/export_data.py      Excel → JSON exporter (Python 3 stdlib only)
tools/check-i18n.mjs      lists _t('…') strings with no English
apps/web/                 Next.js app — the one deployable: launcher at /, shared-UI reference at /ui-kit
packages/db/              @tkg/db   Prisma schema, migrations, importer, seed, data tests, shared filters
packages/ui/              @tkg/ui   shell pieces from the prototype (top bar, sidebar, cards, table, drawer…)
packages/i18n/            @tkg/i18n _t(): Thai string is the key, English in catalogs
modules/materials/        Materials module (filled by the Materials session)
modules/sku-selling/      SKU (Selling) module (filled by the SKU session)
```

## Stack (mirrors ICW-OS-APP as documented in ICW-OS-DESIGN/PLATFORM.md)

TypeScript monorepo · pnpm workspaces + Turborepo · Next.js App Router (one deployable) · Prisma + PostgreSQL 16.
Auth, jobs and file storage are decided later (D-002).

## Run the prototype

```bash
python3 -I tools/export_data.py
cd prototype && python3 -I -m http.server 8791 --bind 127.0.0.1
```

Then open http://127.0.0.1:8791/. Published copy: https://claude.ai/artifact/SgXKTrRmF5K99cyPfojGw3

## Run the app

Prerequisites: Node.js 20+ (this machine: `~/.local/node/bin`, add it to `PATH`), pnpm via `corepack enable`
(the repo pins pnpm 10), PostgreSQL 16 (this machine: Postgres.app on `localhost:5432`, database `tkg_master_data`).

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

```bash
cp .env.example .env
```

Check `DATABASE_URL` and `TKG_DATA_DIR` (the folder with the two `.xlsx` files) in `.env`, then:

```bash
pnpm install
```

```bash
pnpm db:migrate
```

```bash
pnpm db:import
```

```bash
pnpm test
```

```bash
pnpm dev
```

Open http://localhost:3000/ (launcher) and http://localhost:3000/ui-kit (every shared UI piece on real data).

| Command | What it does |
|---|---|
| `pnpm db:migrate` | Applies migrations to the database in `.env` (and creates a new one if the schema changed). |
| `pnpm db:seed` | Adds the reference data that is not in the sheets (the 4 brands). Safe to repeat. |
| `pnpm db:import` | Seeds, then loads both workbooks as **draft** data, replacing the previous draft. Refuses if anything is no longer draft. About 3 s. |
| `pnpm test` | Unit tests plus data tests against the imported database (counts must match the prototype). |
| `pnpm check:i18n` | Fails when a Thai `_t('…')` string has no English. |
| `pnpm db:reset` | Drops and recreates the database schema (local only), then run `pnpm db:import`. |
| `pnpm typecheck` | TypeScript across all packages. |

Everything imported is **draft**. Brand flag 0 in the sheet means *not specified* and creates no brand-usage row.
Every record keeps its import batch, sheet and row; every source row is kept as raw JSON in `import_rows`.
Data rules: [CLAUDE.md](CLAUDE.md). Schema choices: [docs/DECISIONS.md](docs/DECISIONS.md) D-006 onward.
