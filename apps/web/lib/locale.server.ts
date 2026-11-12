// Server side: the request's TH/EN choice comes from the `tkg-locale` cookie. Registered once, imported by the root
// layout. The layout awaits cookies(), which makes every page render per request.
//
// _t() is synchronous, and Next 15 logs an error for synchronous cookies() reads, so the resolver reads the cookie from
// Next's own per-request store instead. That module is internal: re-check this file when upgrading Next (pinned 15.5.28).
import { cookies } from 'next/headers';
import { workUnitAsyncStorage } from 'next/dist/server/app-render/work-unit-async-storage.external';
import { LOCALE_COOKIE, setLocaleResolver, toLocale, type Locale } from '@tkg/i18n';

setLocaleResolver((): Locale | undefined => {
  const store = workUnitAsyncStorage.getStore();
  if (!store || store.type !== 'request') return undefined; // build, tests: fall back to Thai
  return toLocale(store.cookies.get(LOCALE_COOKIE)?.value);
});

export async function requestLocale(): Promise<Locale> {
  return toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}
