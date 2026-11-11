# apps/web

The Next.js app (App Router), the one deployable. Screens follow `prototype/index.html`.

| Route | What | Owner |
|---|---|---|
| `/` | Launcher: Materials and SKU (Selling) under พื้นฐาน | Data / DB session |
| `/ui-kit` | Every shared `@tkg/ui` piece on real draft data — reference for the module sessions | Data / DB session |
| `/materials/…` | `app/(modules)/materials/` | Materials session |
| `/sku/…` | `app/(modules)/sku/` | SKU (Selling) session |

Shared pieces come from `@tkg/ui` (import the CSS once: done in `app/layout.tsx`). Every Thai string goes through
`_t()` from `@tkg/i18n`; app-level English is in `lib/en.json`, a module's in `modules/<id>/i18n/en.json`
(registered in `lib/i18n.ts`). Data comes from `@tkg/db` (`prisma`, `filters`).
