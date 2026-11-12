// @tkg/materials — Materials module (docs/AGENTS.md session 2). See ../SPEC.md.
// Server entry: pages read the database. Client-only pieces the app needs are in './client'.
export const MODULE_ID = 'materials';
export { materialsNav, BASE } from './nav';
export { navCounts } from './queries';
export { parseFilter, filterQuery, listHref, materialWhere, type MaterialFilter } from './filters';
export { MaterialsOverviewPage } from './pages/overview';
export { MaterialListPage } from './pages/list';
export { MaterialSmPage } from './pages/sm';
export { MaterialBrandsPage } from './pages/brands';
export { MaterialCategoriesPage } from './pages/categories';
export { MaterialUnitsPage } from './pages/units';
export { MaterialReviewPage } from './pages/review';
export { MaterialIdsPage } from './pages/ids';
export { MaterialPlaceholderPage, type PlaceholderId } from './pages/placeholder';
