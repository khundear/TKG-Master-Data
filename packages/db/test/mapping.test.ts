// Unit tests for the sheet helpers. No database, no workbook.
import { describe, expect, it } from 'vitest';
import { colIndex, colLetter } from '../src/xlsx';
import { flag, intString, parseUnit, sheetDate, s } from '../src/mapping';

describe('xlsx columns', () => {
  it('converts between letters and indexes', () => {
    expect(colIndex('A1')).toBe(0);
    expect(colIndex('X12')).toBe(23);
    expect(colIndex('AS3')).toBe(44);
    for (const i of [0, 25, 26, 44, 701, 702]) expect(colIndex(colLetter(i) + '1')).toBe(i);
  });
});

describe('sheet values', () => {
  it('reads brand flags: only 1 / TRUE count as used, 0 and blank mean not specified', () => {
    expect(['1', '1.0', 'TRUE', ' 1 '].map(flag)).toEqual([true, true, true, true]);
    expect(['0', '0.0', 'FALSE', '', undefined].map(flag)).toEqual([false, false, false, false, false]);
  });
  it('trims and empties', () => {
    expect(s('  a ')).toBe('a');
    expect(s('   ')).toBeNull();
    expect(s(undefined)).toBeNull();
  });
  it('keeps POS IDs as digits', () => {
    expect(intString('47229499.0')).toBe('47229499');
    expect(intString('47229499')).toBe('47229499');
    expect(intString('SD-RICE-0001')).toBe('SD-RICE-0001');
  });
  it('splits unit labels only when they carry a code', () => {
    expect(parseUnit('EA - ชิ้น')).toEqual({ code: 'EA', nameTh: 'ชิ้น' });
    expect(parseUnit('รับ / นับ')).toBeNull();
    expect(parseUnit(null)).toBeNull();
  });
  it('reads ISO and Excel serial dates', () => {
    expect(sheetDate('2026-10-29')?.toISOString()).toBe('2026-10-29T00:00:00.000Z');
    expect(sheetDate('46324')?.toISOString()).toBe('2026-10-29T00:00:00.000Z');
    expect(sheetDate('')).toBeNull();
  });
});
