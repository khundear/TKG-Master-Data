'use client';
// Gives the SKU module's filter bars the Next.js router (the module itself does not depend on Next.js).
import { useRouter } from 'next/navigation';
import { useMemo, useTransition, type ReactNode } from 'react';
import { NavigateProvider } from '@tkg/sku-selling/client';

export function SkuRouter({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const value = useMemo(
    () => ({
      pending,
      go: (href: string, opts?: { replace?: boolean }) =>
        start(() => (opts?.replace ? router.replace(href, { scroll: false }) : router.push(href))),
    }),
    [router, pending],
  );
  return <NavigateProvider value={value}>{children}</NavigateProvider>;
}
