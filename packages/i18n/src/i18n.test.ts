import { describe, expect, it } from 'vitest';
import { _t, registerCatalog, setLocale, translate } from './index';

describe('_t', () => {
  it('returns Thai as is and fills placeholders', () => {
    setLocale('th');
    expect(_t('{n} รายการ', { n: 3 })).toBe('3 รายการ');
  });
  it('translates to English with plural forms picked on n', () => {
    expect(translate('en', '{n} รายการ', { n: 1 })).toBe('1 item');
    expect(translate('en', '{n} รายการ', { n: 2 })).toBe('2 items');
  });
  it('falls back to Thai when English is missing', () => {
    expect(translate('en', 'ไม่มีคำแปล')).toBe('ไม่มีคำแปล');
  });
  it('does not let a module overwrite core', () => {
    registerCatalog({ 'ก่อนหน้า': 'Back' });
    expect(translate('en', 'ก่อนหน้า')).toBe('Previous');
  });
});
