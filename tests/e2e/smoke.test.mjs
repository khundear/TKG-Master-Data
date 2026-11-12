// Smoke test for the combined app (QA session). No dependencies: Node's built-in test runner and fetch.
//
//   pnpm dev                                   # in one terminal (or pnpm build && pnpm --filter @tkg/web start)
//   node --test tests/e2e/smoke.test.mjs       # in another; BASE_URL=http://localhost:3001 to use another port
//
// It needs `pnpm db:import` to have run, because it checks the counts the pages show.
// It reads the server-rendered HTML only; drawers, mobile width and console errors are checked by hand (FINDINGS.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

/** Visible text of a page: tags, scripts and styles removed, whitespace collapsed. */
async function page(path) {
  const res = await fetch(BASE + path);
  const html = await res.text();
  const text = html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, ' ');
  return { status: res.status, html, text };
}

const ROUTES = [
  '/',
  '/materials', '/materials/list', '/materials/buy', '/materials/sm', '/materials/brands', '/materials/categories',
  '/materials/units', '/materials/review', '/materials/ids', '/materials/approve', '/materials/io', '/materials/log',
  '/materials/config',
  '/sku', '/sku/list', '/sku/stores', '/sku/pos', '/sku/categories', '/sku/brand-categories', '/sku/gaps',
  '/sku/paused', '/sku/approve', '/sku/io', '/sku/log', '/sku/config',
];

test('every route answers 200 and never calls imported data approved', async () => {
  for (const r of ROUTES) {
    const { status, text } = await page(r);
    assert.equal(status, 200, r);
    assert.ok(!text.includes('อนุมัติแล้ว'), `${r} says "approved"`);
    assert.ok(!/\bApproved\b/.test(text), `${r} says "Approved"`);
  }
});

test('module pages carry the draft badge', async () => {
  for (const r of ROUTES.filter((x) => x !== '/')) {
    const { text } = await page(r);
    assert.ok(text.includes('ข้อมูลร่าง · รออนุมัติ'), `${r} has no draft badge`);
  }
});

test('launcher shows both modules with active counts and the draft note', async () => {
  const { text } = await page('/');
  assert.match(text, /Materials .*1,192 รายการ/);
  assert.match(text, /SKU \(Selling\) .*2,418 รายการ/);
  assert.ok(text.includes('ยังเป็นฉบับร่าง'));
});

test('materials: counts, legacy IDs, "not specified" wording, pork is a filter not a menu', async () => {
  const overview = await page('/materials');
  assert.ok(overview.text.includes('1,192'));
  assert.ok(overview.text.includes('RM 963 · SP 220 · SM 9'));
  assert.ok(overview.text.includes('ไม่ใช่ห้ามใช้'), 'brand flag 0 must read as not specified');

  const ids = await page('/materials/ids');
  assert.ok(ids.text.includes('109 จาก 1,194'));
  assert.ok(ids.text.includes('BV_SODA_0001'));

  const legacySearch = await page('/materials/list?q=BV_SODA_0001');
  assert.ok(legacySearch.text.includes('RM_BEV_NONL_CARB_0001'), 'legacy ID finds the current material');
  assert.ok(legacySearch.text.includes('เดิม BV_SODA_0001'), 'legacy ID shown under the current one');

  const pork = await page('/materials/list?pork=1');
  assert.ok(pork.text.includes('จาก 42 รายการ'), 'pork filter count');

  // Pork is never its own menu item
  const nav = overview.html.match(/<nav[\s\S]*?<\/nav>/)?.[0] ?? overview.html;
  assert.ok(!/href="\/materials\/pork/.test(nav));

  const cancelled = await page('/materials/list?st=ยกเลิก');
  assert.ok(cancelled.text.includes('จาก 2 รายการ'));
});

test('sku: counts, POS codes are mappings, paused split by brand', async () => {
  const overview = await page('/sku');
  for (const n of ['2,418', '2,375', '43']) assert.ok(overview.text.includes(n), `overview shows ${n}`);
  assert.ok(overview.text.includes('ไม่ได้ใช้แทนกัน'));

  const pos = await page('/sku/pos');
  assert.ok(pos.text.includes('↔'), 'POS codes shown as a mapping');
  assert.ok(pos.text.includes('ไม่ได้ใช้แทนรหัส TKG'));

  const paused = await page('/sku/paused');
  assert.match(paused.text, /TK 2 HK 0 NT 6 OK 35/);

  const list = await page('/sku/list?status=งดขายชั่วคราว');
  assert.ok(list.text.includes('จาก 43 รายการ'));

  const byPosId = await page('/sku/list?q=47229499');
  assert.ok(byPosId.text.includes('จาก 1 รายการ'), 'search by POS internal ID');
});

test('out-of-range and unknown filter values fall back instead of failing', async () => {
  for (const r of ['/materials/list?page=999', '/materials/list?page=abc', '/materials/list?br=XX', '/sku/list?page=999',
    '/sku/list?br=ZZ', '/sku/list?gap=zzz', '/sku/brand-categories?brand=ZZ', '/materials/review?tab=zzz']) {
    const { status } = await page(r);
    assert.equal(status, 200, r);
  }
});
