// SKU (Selling) module (docs/AGENTS.md session 2). See ../SPEC.md.
// SKU data is not final: screens show today's data as stored; nothing here cleanses or restructures it.
// Server entry point (pages and queries read the database). Client components never import this file.
export const MODULE_ID = 'sku-selling';

export * from './params';
export * from './types';
export { skuNav } from './nav';
export { getNavCounts, PER_PAGE } from './queries';
export { SkuOverviewPage } from './pages/overview';
export { SkuListPage, SkuPausedPage, SkuPosPage } from './pages/lists';
export { SkuStoresPage, SkuCategoriesPage, SkuBrandCategoriesPage, SkuGapsPage } from './pages/reference';
export { SkuPlaceholderPage, type SkuPlaceholderKind } from './pages/placeholders';
