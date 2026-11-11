/** 1234 → "1,234"; null → "—". Numbers use Western digits, as in the prototype. */
export const fmt = (n: number | null | undefined): string => (n == null ? '—' : Number(n).toLocaleString('en-US'));
/** Money with up to 2 decimals. */
export const money = (n: number | string | null | undefined): string =>
  n == null ? '—' : Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
/** Class names joined, falsy skipped. */
export const cx = (...c: (string | false | null | undefined)[]): string => c.filter(Boolean).join(' ');
