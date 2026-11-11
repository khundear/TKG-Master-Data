'use client';
// The UI kit does not depend on Next.js. The app passes its Link component and pathname hook in once.
import { createContext, useContext, type ComponentType, type ReactNode } from 'react';

export interface LinkProps {
  href: string;
  className?: string;
  children?: ReactNode;
  'aria-label'?: string;
  'aria-current'?: 'page';
  onClick?: () => void;
}

interface UiContextValue {
  Link: ComponentType<LinkProps>;
  usePathname: () => string;
}

const PlainLink = ({ children, ...p }: LinkProps) => <a {...p}>{children}</a>;
const UiContext = createContext<UiContextValue>({
  Link: PlainLink,
  usePathname: () => (typeof window === 'undefined' ? '/' : window.location.pathname),
});

export function UiProvider({ Link, usePathname, children }: Partial<UiContextValue> & { children: ReactNode }) {
  const parent = useContext(UiContext);
  return (
    <UiContext.Provider value={{ Link: Link ?? parent.Link, usePathname: usePathname ?? parent.usePathname }}>
      {children}
    </UiContext.Provider>
  );
}

export const useUi = () => useContext(UiContext);

/** A link that uses the app's router when there is one. */
export function UiLink(props: LinkProps) {
  const { Link } = useUi();
  return <Link {...props} />;
}
