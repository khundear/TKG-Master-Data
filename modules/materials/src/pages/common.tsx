// Pieces shared by the Materials pages.
import type { Crumb } from '@tkg/ui';

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** "Materials / <page>" breadcrumb. */
export const crumbs = (label: string): Crumb[] => [{ label: 'Materials', href: '/materials' }, { label }];

export const pageNumber = (v: string | string[] | undefined): number => {
  const n = Number.parseInt(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

