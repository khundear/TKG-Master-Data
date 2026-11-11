# How the build is split

Four sessions, one branch and one pull request each. Each owns folders; nobody edits another session's folders.

| Order | Session | Owns | Delivers | Waits for |
|---|---|---|---|---|
| 1 | **Data / DB** | `packages/db/`, `tools/`, root configs (`package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig*`), `apps/web/` scaffold | Monorepo scaffold; Prisma schema for Materials + SKU (from IMPLEMENTATION-CONTEXT appendix, trimmed to what the two modules need); import from `Data/*.xlsx` into staging tables; seed; data tests (counts must match the prototype: 1,192 active materials, 2,418 SKUs) | Node.js + pnpm + PostgreSQL installed |
| 2 | **Materials** | `modules/materials/` (+ its route under `apps/web/app/(modules)/materials/`) | Every page in `modules/materials/SPEC.md`, reading the DB | Session 1 merged |
| 2 | **SKU (Selling)** | `modules/sku-selling/` (+ its route under `apps/web/app/(modules)/sku/`) | Every page in `modules/sku-selling/SPEC.md`, reading the DB. No SKU data cleansing. | Session 1 merged |
| 3 | **QA** | `tests/e2e/`, nothing else | Browser checks of both modules against `prototype/`, data-rule checks, mobile overflow, i18n gaps; a findings list, no fixes | Sessions 2 merged |

The two module sessions run at the same time. Shared UI pieces (shell, sidebar, table, drawer) are built once by
session 1 in `packages/ui/` from the prototype, so the modules don't each invent their own.

## Hand-off rules

- Every session starts by reading `CLAUDE.md`, `IMPLEMENTATION-CONTEXT.md` and its module's `SPEC.md`.
- A module session that needs a schema change asks the Data / DB session (or the user); it does not edit `packages/db/`.
- Each session ends with: what it built, what it did not, how it was checked.
