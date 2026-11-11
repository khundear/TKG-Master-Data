# Decision log

| ID | Date | Decision | Why |
|---|---|---|---|
| D-001 | 2026-11-11 | Build in a **standalone TKG repo**, not as a core module in ICW-OS-APP or a client overlay in icw-clients. Never touch those two repos. | User's choice: keep TKG work independent of ICW's product repos. Cost: moving into ICW later means a port. We reduce that cost by mirroring ICW-OS-APP's documented layout (D-002). |
| D-002 | 2026-11-11 | Stack mirrors ICW-OS-APP as documented in ICW-OS-DESIGN/PLATFORM.md: TypeScript monorepo (pnpm + Turborepo), Next.js App Router as one deployable, Prisma + PostgreSQL 16, one schema in `packages/db`, one folder per module in `modules/`. Auth, background jobs, file storage and hosting are **open**. | Same shape as ICW so code can be lifted later; avoid deciding auth/hosting before the org's OS contract is known (IMPLEMENTATION-CONTEXT §10.1). |
| D-003 | 2026-11-11 | UI follows ICW-OS-DESIGN (look and structure). CEO wireframe and old TKG CI are retired. | User instruction. |
| D-004 | 2026-11-11 | Launcher shows only Materials and SKU (Selling), both under พื้นฐาน. | User instruction. |
| D-005 | 2026-11-11 | `Data/*.xlsx` stays out of git. | Business data; sessions read it from the main checkout path. |

## Open (see IMPLEMENTATION-CONTEXT.md §10)

- Auth / SSO, hosting, backups.
- Material and SKU code formats, UUID policy, POS mapping per branch.
- Owners and approvers per data type.
- SKU cleansing and restructure — waits for the user.
- GitHub remote for this repo (owner and name).
