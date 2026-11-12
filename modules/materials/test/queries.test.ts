// Page queries against the imported (draft) data. Run after `pnpm db:import`.
// Expected numbers are the approved prototype's (prototype/data.json), except where the DB follows the spec (D-011).
import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from '@tkg/db';
import { EMPTY_FILTER, type MaterialFilter } from '../src/filters';
import { activeSummary, changedIds, listMaterials, navCounts, reviewMaterials, smMaterials } from '../src/queries';

afterAll(() => prisma.$disconnect());
const total = async (f: Partial<MaterialFilter>) => (await listMaterials({ ...EMPTY_FILTER, ...f })).total;

describe('material list filters', () => {
  it('shows 1,192 active materials, 50 per page', async () => {
    const r = await listMaterials(EMPTY_FILTER);
    expect(r.total).toBe(1192);
    expect(r.rows).toHaveLength(50);
    expect(r.rows.every((m) => m.mappingStatus !== 'ยกเลิก')).toBe(true);
  });

  it('brand pills: one brand, shared 2+, not specified', async () => {
    expect(await total({ br: 'TK' })).toBe(597);
    expect(await total({ br: 'multi' })).toBe(362);
    expect(await total({ br: 'none' })).toBe(148);
  });

  it('group, main category, status, pork, Bible category, unit and search', async () => {
    expect(await total({ grp: 'RM' })).toBe(963);
    expect(await total({ grp: 'SP' })).toBe(220);
    expect(await total({ grp: 'SM' })).toBe(9);
    expect(await total({ grp: 'RM', p1: 'PROTEIN' })).toBe(228);
    expect(await total({ st: 'ต้องตัดสินใจ' })).toBe(67);
    expect(await total({ st: 'ยกเลิก' })).toBe(2);
    expect(await total({ pork: true })).toBe(41); // spare parts left out (QA finding 3)
    expect(await total({ bible: 'RM_PROTN' })).toBe(223);
    expect(await total({ unit: 'none' })).toBe(941);
    expect(await total({ unit: 'EA' })).toBe(107);
    expect(await total({ q: 'หมู', br: 'TK' })).toBe(20);
  });

  it('clamps a page past the end', async () => {
    const r = await listMaterials({ ...EMPTY_FILTER, br: 'none', page: 99 });
    expect(r.page).toBe(3);
    expect(r.rows).toHaveLength(48);
  });
});

describe('other pages', () => {
  it('menu counts', async () => {
    expect(await navCounts()).toEqual({ active: 1192, sm: 9, decide: 67, changed: 109 });
  });

  it('SM, review tabs and changed IDs', async () => {
    expect(await smMaterials()).toHaveLength(9);
    const r = await reviewMaterials('move');
    expect(r.counts).toEqual({ decide: 67, move: 277, check: 1 });
    expect(r.rows).toHaveLength(277);
    const ids = await changedIds(3);
    expect(ids).toMatchObject({ total: 109, all: 1194, page: 3 });
    expect(ids.rows.every((m) => m.code !== m.legacyCode)).toBe(true);
  });

  it('brand usage summary keeps overlaps (not added up)', async () => {
    const s = await activeSummary();
    expect(s).toHaveLength(1192);
    expect(s.filter((m) => m.brands.includes('OK'))).toHaveLength(199);
  });
});
