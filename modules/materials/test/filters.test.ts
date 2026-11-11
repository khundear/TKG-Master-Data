// URL ↔ filter round trip and the shape of the Prisma where clause. No database needed.
import { describe, expect, it } from 'vitest';
import { EMPTY_FILTER, filterQuery, groupOf, hasFilter, inBible, listHref, materialWhere, parseFilter } from '../src/filters';

describe('parseFilter', () => {
  it('reads every filter from the URL', () => {
    const f = parseFilter(new URLSearchParams('q=หมู&br=TK&grp=RM&p1=PROTEIN&st=ย้ายหมวด&pork=1&bible=RM_PROTN&unit=EA&page=3'));
    expect(f).toEqual({ q: 'หมู', br: 'TK', grp: 'RM', p1: 'PROTEIN', st: 'ย้ายหมวด', pork: true, bible: 'RM_PROTN', unit: 'EA', page: 3 });
  });

  it('ignores unknown brand / group values and bad pages', () => {
    const f = parseFilter({ br: 'XX', grp: 'ZZ', page: '-2' });
    expect(f.br).toBe('');
    expect(f.grp).toBe('');
    expect(f.page).toBe(1);
    expect(parseFilter({ br: ['multi', 'none'] }).br).toBe('multi');
    expect(parseFilter({ br: 'none' }).br).toBe('none');
  });

  it('round-trips through filterQuery', () => {
    const f = { ...EMPTY_FILTER, q: 'a b', br: 'none' as const, pork: true, unit: 'รับ / นับ', page: 2 };
    expect(parseFilter(new URLSearchParams(filterQuery(f).slice(1)))).toEqual(f);
  });

  it('leaves empty fields and page 1 out of links', () => {
    expect(listHref()).toBe('/materials/list');
    expect(listHref({ grp: 'RM', p1: 'PROTEIN', page: 1 })).toBe('/materials/list?grp=RM&p1=PROTEIN');
    expect(hasFilter(EMPTY_FILTER)).toBe(false);
    expect(hasFilter({ ...EMPTY_FILTER, pork: true })).toBe(true);
  });
});

describe('materialWhere', () => {
  it('hides cancelled items unless a status is asked for', () => {
    expect(materialWhere(EMPTY_FILTER)).toEqual({ AND: [{ isCancelled: false }] });
    expect(materialWhere({ ...EMPTY_FILTER, st: 'ยกเลิก' })).toEqual({ AND: [{ mappingStatus: 'ยกเลิก' }] });
  });

  it('treats "no brand" as no usage row (not specified), never as not allowed', () => {
    const w = JSON.stringify(materialWhere({ ...EMPTY_FILTER, br: 'none' }));
    expect(w).toContain('"none":{"usage":"used"}');
    expect(w).not.toContain('not_used');
  });

  it('uses the ids it is given for 2+ brands', () => {
    expect(materialWhere({ ...EMPTY_FILTER, br: 'multi' }, ['a', 'b']).AND).toContainEqual({ id: { in: ['a', 'b'] } });
  });
});

describe('helpers', () => {
  it('matches a Bible code and everything under it', () => {
    expect(inBible('RM_PROTN_PORK', 'RM_PROTN')).toBe(true);
    expect(inBible('RM_PROTN', 'RM_PROTN')).toBe(true);
    expect(inBible('RM_PROTNX', 'RM_PROTN')).toBe(false);
    expect(inBible(null, 'RM_PROTN')).toBe(false);
  });

  it('counts "คงไว้เป็น SM" as SM', () => {
    expect(groupOf({ group: 'RM', mappingStatus: 'คงไว้เป็น SM' })).toBe('SM');
    expect(groupOf({ group: 'SP', mappingStatus: 'ตรงกัน' })).toBe('SP');
  });
});
