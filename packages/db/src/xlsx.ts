// Minimal .xlsx reader: a TypeScript port of the Workbook class in tools/export_data.py.
// Reads shared strings, inline strings and plain values; drops empty cells. No formatting, no formulas.
import { readFileSync } from 'node:fs';
import { unzipSync, strFromU8 } from 'fflate';
import { XMLParser } from 'fast-xml-parser';

/** Cells of one row, keyed by 0-based column index (A = 0). Values are trimmed-non-empty strings. */
export type Row = Map<number, string>;
/** Rows keyed by 1-based sheet row number. */
export type Rows = Map<number, Row>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
  isArray: (name) => ['si', 'r', 'row', 'c', 'sheet', 'Relationship'].includes(name),
});

/** "AB12" → 27 (0-based column index). */
export function colIndex(ref: string): number {
  const letters = /^[A-Z]+/.exec(ref)?.[0] ?? '';
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** 0 → "A", 27 → "AB". */
export function colLetter(index: number): string {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

type XNode = Record<string, unknown>;

/** Text of a <t> node, which the parser returns as a string or as { '#text': … } when it has attributes. */
function textOf(t: unknown): string {
  if (t == null) return '';
  if (typeof t === 'string' || typeof t === 'number') return String(t);
  if (typeof t === 'object' && '#text' in (t as XNode)) return String((t as XNode)['#text'] ?? '');
  return '';
}

/** Rich text: <si><t/></si> or <si><r><t/></r>…</si>. Phonetic runs (<rPh>) are ignored. */
function richText(node: XNode | undefined): string {
  if (!node) return '';
  let out = textOf(node.t);
  for (const r of (node.r as XNode[] | undefined) ?? []) out += textOf(r.t);
  return out;
}

export class Workbook {
  private files: Record<string, Uint8Array>;
  private strings: string[] = [];
  readonly sheets = new Map<string, string>();

  constructor(path: string) {
    this.files = unzipSync(readFileSync(path));
    const ss = this.xml('xl/sharedStrings.xml');
    if (ss) {
      for (const si of ((ss.sst as XNode)?.si as XNode[] | undefined) ?? []) this.strings.push(richText(si));
    }
    const wb = this.xml('xl/workbook.xml');
    const rels = this.xml('xl/_rels/workbook.xml.rels');
    const rmap = new Map<string, string>();
    for (const r of ((rels?.Relationships as XNode)?.Relationship as XNode[] | undefined) ?? []) {
      rmap.set(String(r['@Id']), String(r['@Target']));
    }
    const sheetList = (((wb?.workbook as XNode)?.sheets as XNode)?.sheet as XNode[] | undefined) ?? [];
    for (const sh of sheetList) {
      const target = (rmap.get(String(sh['@r:id'])) ?? '').replace(/^\//, '');
      this.sheets.set(String(sh['@name']), target.startsWith('xl/') ? target : `xl/${target}`);
    }
  }

  private xml(name: string): XNode | undefined {
    const f = this.files[name];
    return f ? (parser.parse(strFromU8(f)) as XNode) : undefined;
  }

  /** All non-empty cells of a sheet. Throws with the list of sheet names when the sheet is missing. */
  rows(name: string): Rows {
    const path = this.sheets.get(name);
    if (!path) throw new Error(`Sheet not found: ${JSON.stringify(name)}. Sheets: ${[...this.sheets.keys()].join(', ')}`);
    const root = this.xml(path);
    const data = ((root?.worksheet as XNode)?.sheetData as XNode | undefined) ?? {};
    const out: Rows = new Map();
    for (const row of (data.row as XNode[] | undefined) ?? []) {
      const vals: Row = new Map();
      for (const c of (row.c as XNode[] | undefined) ?? []) {
        const type = c['@t'] as string | undefined;
        let x: string | undefined;
        if (type === 's' && c.v != null) x = this.strings[Number(textOf(c.v))];
        else if (type === 'inlineStr') x = richText(c.is as XNode | undefined);
        else if (c.v != null) x = textOf(c.v);
        if (x != null && x.trim() !== '') vals.set(colIndex(String(c['@r'])), x);
      }
      out.set(Number(row['@r']), vals);
    }
    return out;
  }
}
