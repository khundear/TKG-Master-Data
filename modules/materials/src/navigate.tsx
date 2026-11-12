'use client';
// The module does not depend on Next.js (like @tkg/ui). The app passes its router in once, in the materials layout.
// Added here because @tkg/ui's UiProvider only carries Link and the pathname, and the filter bar must change the URL.
import { createContext, useContext, type ReactNode } from 'react';

export type Navigate = (href: string, opts?: { replace?: boolean }) => void;

const NavigateContext = createContext<Navigate>((href) => {
  window.location.assign(href);
});

export function NavigateProvider({ navigate, children }: { navigate: Navigate; children: ReactNode }) {
  return <NavigateContext.Provider value={navigate}>{children}</NavigateContext.Provider>;
}

export const useNavigate = () => useContext(NavigateContext);
