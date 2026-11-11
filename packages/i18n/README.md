# @tkg/i18n

`_t()` with the ICW OS convention: the Thai string is the key, English lives in catalogs.

```ts
import { _t } from '@tkg/i18n';
_t('ก่อนหน้า');                       // Thai by default
_t('{n} รายการ', { n: rows.length }); // plural forms are picked on vars.n only
```

Catalogs: shared shell words in `src/core.json`; app pages in `apps/web/lib/en.json`; a module's words in
`modules/<id>/i18n/en.json` (registered in `apps/web/lib/i18n.ts`). `pnpm check:i18n` fails on a Thai key with no English.
Never build a sentence by concatenation.
