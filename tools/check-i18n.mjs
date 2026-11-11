#!/usr/bin/env node
// pnpm check:i18n — lists Thai strings passed to _t('…') that have no English in any catalog.
// Catalogs: packages/i18n/src/core.json, apps/web/lib/en.json, modules/*/i18n/en.json.
// Exit code 1 when something is missing (use in CI); --warn only prints.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const catalogs = ['packages/i18n/src/core.json', 'apps/web/lib/en.json'];
for (const m of readdirSync(join(root, 'modules'))) catalogs.push(`modules/${m}/i18n/en.json`);
const known = new Set();
for (const c of catalogs) if (existsSync(join(root, c))) Object.keys(JSON.parse(readFileSync(join(root, c), 'utf8'))).forEach((k) => known.add(k));

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    if (['node_modules', '.next', '.turbo', 'dist'].includes(f)) continue;
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|mjs)$/.test(f) && !/\.test\.tsx?$/.test(f)) files.push(p);
  }
};
for (const d of ['apps', 'packages', 'modules']) walk(join(root, d));

const thai = /[฀-๿]/;
const call = /_t\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g;
const missing = [];
for (const f of files) {
  // drop comments so examples in doc comments are not counted
  const src = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const m of src.matchAll(call)) {
    const key = m[2];
    if (thai.test(key) && !known.has(key)) missing.push(`${relative(root, f)}: ${key}`);
  }
}
if (missing.length) {
  console.log(`${missing.length} Thai string(s) without English:\n${missing.join('\n')}`);
  if (!process.argv.includes('--warn')) process.exit(1);
} else console.log('i18n: every _t() key has English');
