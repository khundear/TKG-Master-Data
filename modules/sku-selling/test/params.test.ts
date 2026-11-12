// Run with `pnpm --filter @tkg/sku-selling test` (Node's own test runner; params.ts has no runtime imports).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NONE,
  clampPage,
  hasActiveFilters,
  listHref,
  parseListFilters,
  parsePosFilters,
  patchFilters,
  posWhere,
  skuWhere,
} from '../src/params.ts';

const empty = { br: '', q: '', l1: '', l2: '', status: '', gap: '' as const };

test('parses list filters from the URL and drops unknown values', () => {
  const f = parseListFilters({ br: 'XX', q: '  ไก่ ', l1: 'อาหาร', gap: 'nope', page: '-3' });
  assert.deepEqual(f, { br: '', q: 'ไก่', l1: 'อาหาร', l2: '', status: '', gap: '', page: 1 });
  assert.equal(parseListFilters({ br: 'NT', gap: 'pos', page: '4' }).page, 4);
  assert.equal(parseListFilters({ br: ['HK', 'TK'] }).br, 'HK');
  assert.deepEqual(parsePosFilters({ br: 'OK', q: '4722', page: '2' }), { br: 'OK', q: '4722', page: 2 });
});

test('list links keep only set filters and leave out page 1', () => {
  assert.equal(listHref(), '/sku/list');
  assert.equal(listHref({ br: 'TK', page: 1 }), '/sku/list?br=TK');
  assert.equal(listHref({ gap: 'note', page: 3 }), '/sku/list?gap=note&page=3');
  assert.equal(listHref({ l2: 'อาหารจานเดียว' }), `/sku/list?l2=${encodeURIComponent('อาหารจานเดียว')}`);
});

test('changing a filter goes back to page 1 and a new type clears L2', () => {
  const f = { ...empty, l1: 'อาหาร', l2: 'อาหารจานเดียว', page: 5 };
  assert.deepEqual(patchFilters(f, { br: 'HK' }), { ...f, br: 'HK', page: 1 });
  assert.deepEqual(patchFilters(f, { l1: 'เครื่องดื่ม' }), { ...f, l1: 'เครื่องดื่ม', l2: '', page: 1 });
  assert.equal(patchFilters(f, { page: 2 }).page, 2);
  assert.equal(hasActiveFilters({ ...empty, page: 3 }), false);
  assert.equal(hasActiveFilters({ ...empty, gap: 'pos', page: 1 }), true);
});

test('pages are clamped to what exists', () => {
  assert.equal(clampPage(99, 120, 50), 3);
  assert.equal(clampPage(0, 120, 50), 1);
  assert.equal(clampPage(4, 0, 50), 1);
});

test('where: status is the POS snapshot status, type "none" is empty L1, search covers names, key and POS codes', () => {
  assert.deepEqual(skuWhere(empty), {});
  const w = skuWhere({ ...empty, br: 'TK', l1: NONE, status: 'งดขายชั่วคราว', q: '4722' });
  assert.deepEqual(w.AND?.slice(0, 3), [
    { brand: { code: 'TK' } },
    { l1: null },
    { posMappings: { some: { salesStatus: 'งดขายชั่วคราว' } } },
  ]);
  const search = JSON.stringify((w.AND as unknown[])[3]);
  for (const field of ['nameEn', 'nameTh', 'masterRecordKey', 'posInternalId', 'posSkuCode']) assert.ok(search.includes(field), field);
  assert.deepEqual(skuWhere({ ...empty, gap: 'pos' }), { AND: [{ posMappings: { none: { posSkuCode: { not: null } } } }] });
  assert.deepEqual(posWhere({ br: '', q: '', page: 1 }), {});
});
