// @tkg/i18n — Thai-key translation, the ICW OS convention (ICW-OS-DESIGN/CLAUDE.md §1).
//
// Every user-visible Thai string goes through `_t()`. The Thai source string is the catalog key; English lives only
// in catalogs: shared shell words in `core.json`, a module's words in `modules/<id>/i18n/en.json`.
//
//   _t('บันทึก')
//   _t('{n} รายการ', { n: rows.length })       // plural forms are picked on vars.n only
//
// Never build a sentence by concatenation; use one key with {placeholders}.
import core from './core.json';

export type Locale = 'th' | 'en';
export type Entry = string | { one: string; other: string };
export type Catalog = Record<string, Entry>;
export type Vars = Record<string, string | number>;

const catalogs: Record<Locale, Catalog> = { th: {}, en: { ...(core as Catalog) } };
let current: Locale = 'th';

/** Add English (or another locale's) strings. Entries already present win, so a module cannot overwrite core. */
export function registerCatalog(entries: Catalog, locale: Locale = 'en'): void {
  catalogs[locale] = { ...entries, ...catalogs[locale] };
}

export function setLocale(locale: Locale): void {
  current = locale;
}
export function getLocale(): Locale {
  return current;
}

function fill(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

const plural = new Intl.PluralRules('en');

/** Translate a Thai key into `locale`. Missing entries fall back to the Thai text. */
export function translate(locale: Locale, key: string, vars?: Vars): string {
  const entry = locale === 'th' ? undefined : catalogs[locale][key];
  if (entry == null) return fill(key, vars);
  if (typeof entry === 'string') return fill(entry, vars);
  const n = Number(vars?.n);
  return fill(plural.select(n) === 'one' ? entry.one : entry.other, vars);
}

/** Translate into the current locale. The global is `_t`, never `t`. */
export function _t(key: string, vars?: Vars): string {
  return translate(current, key, vars);
}

/** Thai keys with no English, for the i18n check. */
export function missing(keys: Iterable<string>, locale: Locale = 'en'): string[] {
  return [...keys].filter((k) => catalogs[locale][k] == null);
}
