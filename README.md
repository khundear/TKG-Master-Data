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
CLAUDE.md                 rules for every Claude Code session working here (read first)
IMPLEMENTATION-CONTEXT.md full business context and data rules (Thai)
docs/DECISIONS.md         decision log (D-001 …)
docs/AGENTS.md            how the build is split across sessions, who owns which folder
Data/                     source Excel files — NOT in git (business data)
CI/                       TKG logo
prototype/                approved clickable prototype (static HTML, real data)
tools/export_data.py      Excel → JSON exporter (Python 3 stdlib only)
apps/web/                 Next.js app — the one deployable (not scaffolded yet)
packages/db/              Prisma schema, migrations, seeds (not scaffolded yet)
modules/materials/        Materials module: SPEC.md now, code later
modules/sku-selling/      SKU (Selling) module: SPEC.md now, code later
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

## Prerequisites for the real app

- Node.js 20 LTS or newer, and pnpm (`corepack enable`)
- PostgreSQL 16 (local install or Docker)

Neither is installed on the original machine yet (11 Nov 2026).
