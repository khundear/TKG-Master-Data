'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { UiProvider, type LinkProps } from '@tkg/ui';
import '../lib/i18n';

const NextLink = ({ href, children, ...rest }: LinkProps) => (
  <Link href={href} {...rest}>
    {children}
  </Link>
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UiProvider Link={NextLink} usePathname={() => usePathname() ?? '/'}>
      {children}
    </UiProvider>
  );
}
