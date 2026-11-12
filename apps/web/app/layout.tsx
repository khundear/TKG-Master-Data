import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@tkg/ui/styles.css';
import '../lib/i18n';
import { requestLocale } from '../lib/locale.server';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'TKG Master Data',
  icons: { icon: '/tkg-logo.png' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await requestLocale();
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+Thai:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
