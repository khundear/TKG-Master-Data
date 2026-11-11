'use client';
// Gives the Materials module the Next.js router (the module itself does not depend on Next.js).
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { NavigateProvider } from '@tkg/materials/client';

export function RouterBridge({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <NavigateProvider navigate={(href, o) => (o?.replace ? router.replace(href, { scroll: false }) : router.push(href))}>
      {children}
    </NavigateProvider>
  );
}
