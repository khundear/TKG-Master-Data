'use client';
// The module does not depend on Next.js. The route layout passes the router in once (apps/web/app/(modules)/sku/).
// Not a new shell piece: @tkg/ui's UiProvider only carries Link and pathname, and the filter bar needs to navigate.
import { createContext, useContext, type ReactNode } from 'react';

export interface Navigator {
  /** Go to `href`. `replace` is used while typing in a search box (no new history entry, no scroll). */
  go: (href: string, opts?: { replace?: boolean }) => void;
  /** True while the next page is loading. */
  pending: boolean;
}

const NavigateContext = createContext<Navigator>({
  go: (href: string) => {
    if (typeof window !== 'undefined') window.location.assign(href);
  },
  pending: false,
});

export function NavigateProvider({ value, children }: { value: Navigator; children: ReactNode }) {
  return <NavigateContext.Provider value={value}>{children}</NavigateContext.Provider>;
}

export const useNavigate = () => useContext(NavigateContext);
