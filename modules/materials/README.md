# @tkg/materials

Every page in `SPEC.md`, reading the database through `@tkg/db`. Routes are thin files in
`apps/web/app/(modules)/materials/`; pages, queries and components live here.

| File | What |
|---|---|
| `src/filters.ts` | List filters ↔ URL (`?br=TK&grp=RM&p1=PROTEIN&st=…&pork=1&bible=RM_PROTN&unit=EA&q=…&page=2`) → Prisma `where`. `listHref()` builds links from other pages. |
| `src/queries.ts` | Server reads for each page. |
| `src/pages/*.tsx` | Server pages: overview, list, sm, brands, categories, units, review (`?tab=decide|move|check`), ids, placeholders. |
| `src/components/` | Client pieces: list filter bar, material table + detail drawer, clickable table row. |
| `src/labels.ts` | Thai labels for codes (brands, groups, main categories, category status) through `_t()`. |
| `src/nav.ts` | Left menu. |
| `src/navigate.tsx`, `src/client.ts` | Added here (not in `@tkg/ui`): a router context so the filter bar can change the URL without the module depending on Next.js. The app provides it in `router-bridge.tsx`. |
| `src/materials.css` | Link styles for pills / tree rows / tabs (the prototype draws them as buttons) and one inline style from the prototype. |
| `test/` | `filters.test.ts` (no DB) and `queries.test.ts` (after `pnpm db:import`; counts match the prototype). |

Rules kept: no usage row = "ยังไม่ระบุ" (dashed), never "not allowed"; มีหมู is a filter on the list; every count is
draft data (the drawer says "ฉบับร่าง · รอตรวจและอนุมัติ"); the legacy ID shows under a changed ID and in the drawer.
