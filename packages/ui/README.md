# @tkg/ui

Shared shell pieces from `prototype/index.html`, styled with the ICW OS tokens the prototype uses. Class names are the
prototype's, so a screen can be compared with the prototype one to one. See them all on real data at `/ui-kit`.

```tsx
import '@tkg/ui/styles.css'; // once, in apps/web/app/layout.tsx (done)
import { ModuleShell, PageHeader, Metrics, MetricCard, Card, Toolbar, SearchBox, FilterPills, TogglePill,
         DataTable, Pager, StatusChip, BrandCodes, Drawer, DrawerSection, KeyValues, Note, EmptyState } from '@tkg/ui';
```

| Piece | Prototype |
|---|---|
| `TopBar`, `Sidebar`, `ModuleShell` (top bar + left menu + content, mobile menu button) | `topbar()`, `sidebar()` |
| `LauncherGroup`, `Tile`, `AppFooter` | `launcher()`, `footer()` |
| `PageHeader` (crumbs, title, description, actions), `Card`, `Note`, `EmptyState`, `Tag`, `Button`, `Bar` | `head()`, `.card`, `.note`, `emptyState()` |
| `MetricCard`, `Metrics` | `metric()` |
| `DataTable`, `Pager` (50 per page; links or callbacks) | `matTable()`, `pager()` |
| `Toolbar`, `SearchBox`, `Select`, `FilterPills`, `TogglePill` | `.tools`, `.search`, `.sel`, `.pill` |
| `StatusChip` (ok · info · warn · mute · bad), `BrandCodes` (dashed = not specified) | `chip()`, `brandCodes()` |
| `Drawer`, `DrawerSection`, `KeyValues` | `matDrawer()`, `skuDrawer()` |
| `Icon` (the prototype's Lucide set), `fmt`, `money` | `ic()`, `fmt()`, `money()` |

Labels you pass in must already go through `_t()`; built-in strings (pager, close, menu) do.
Links use the app's router through `UiProvider` (set up in `apps/web/app/providers.tsx`).
