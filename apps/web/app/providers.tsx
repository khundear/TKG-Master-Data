'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { setLocale, type Locale } from '@tkg/i18n';
import { UiProvider, type LinkProps } from '@tkg/ui';
import '../lib/i18n';

const NextLink = ({ href, children, ...rest }: LinkProps) => (
  <Link href={href} {...rest}>
    {children}
  </Link>
);

export function Providers({ locale, children }: { locale: Locale; children: ReactNode }) {
  setLocale(locale); // client components read the global; set before any child renders
  return (
    <UiProvider Link={NextLink} usePathname={() => usePathname() ?? '/'}>
      {children}
    </UiProvider>
  );
}
