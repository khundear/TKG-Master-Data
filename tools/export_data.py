#!/usr/bin/env python3
"""Export the two TKG master-data workbooks to prototype/data.json.

Standard library only (no openpyxl). Run from the repo root:

    python3 -I tools/export_data.py [--data DIR] [--out FILE]

Sources (sheet -> fields):
  Material workbook
    Material Mapping (Excel)  row 9+   legacy ID, name, current category, proposed Excel code, group/primary/
                                       secondary/tertiary, Thai category name, mapping status, note
    Material ID Crosswalk     row 5+   current ID, ID change, Bible code, flag          (joined on legacy ID)
    Meterials (All Brands)    row 12+  description, kind, TK/HK/NT/OK flags (1 = used, 0 = not specified),
                                       unit (col X), temperature (col AS)               (joined on legacy ID)
    Material Master Bible     row 16+  category tree (level 0-3) with counts
  SKU workbook
    Selling SKU Master        row 10+  key, names, L1-L3, SKU category code, brand menu category, notes, brand flags
    SKU-Store Mapping         row 4+   store, POS code / internal ID, POS label, group, category, price, status, date
    SKU Categories            row 4+   central category tree
    Brand Menu Categories     row 4+   brand menu categories
"""
import argparse
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
MATERIAL_FILE = 'TKG Material Master Data (All Aspect) - Working Sheet.xlsx'
SKU_FILE = 'Selling SKU Master Data — TK + HK + NT + OK.xlsx'
BRANDS = ['TK', 'HK', 'NT', 'OK']


def col_index(ref):
    n = 0
    for ch in re.match(r'[A-Z]+', ref).group():
        n = n * 26 + ord(ch) - 64
    return n - 1


class Workbook:
    def __init__(self, path):
        self.z = zipfile.ZipFile(path)
        self.strings = []
        if 'xl/sharedStrings.xml' in self.z.namelist():
            for si in ET.fromstring(self.z.read('xl/sharedStrings.xml')).findall('m:si', NS):
                self.strings.append(''.join(t.text or '' for t in si.iter('{%s}t' % NS['m'])))
        wb = ET.fromstring(self.z.read('xl/workbook.xml'))
        rels = ET.fromstring(self.z.read('xl/_rels/workbook.xml.rels'))
        rmap = {r.get('Id'): r.get('Target') for r in rels}
        self.sheets = {}
        for sh in wb.find('m:sheets', NS):
            t = rmap[sh.get('{%s}id' % NS['r'])].lstrip('/')
            self.sheets[sh.get('name')] = t if t.startswith('xl/') else 'xl/' + t

    def rows(self, name):
        """Return {row_number: {col_index: value}} with empty cells dropped."""
        if name not in self.sheets:
            sys.exit(f'Sheet not found: {name!r}. Sheets: {", ".join(self.sheets)}')
        out = {}
        root = ET.fromstring(self.z.read(self.sheets[name]))
        for row in root.findall('.//m:sheetData/m:row', NS):
            vals = {}
            for c in row.findall('m:c', NS):
                v = c.find('m:v', NS)
                typ = c.get('t')
                if typ == 's' and v is not None:
                    x = self.strings[int(v.text)]
                elif typ == 'inlineStr':
                    x = ''.join(t.text or '' for t in c.iter('{%s}t' % NS['m']))
                else:
                    x = v.text if v is not None else None
                if x is not None and str(x).strip() != '':
                    vals[col_index(c.get('r'))] = x
            out[int(row.get('r'))] = vals
        return out


def s(x):
    return str(x).strip() if x is not None else ''


def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def flag(x):
    return s(x) in ('1', '1.0', 'TRUE')


def export_materials(path):
    wb = Workbook(path)
    crosswalk = {s(v.get(1)): v for r, v in wb.rows('Material ID Crosswalk').items() if r >= 5 and v.get(1)}
    brands = {s(v.get(2)): v for r, v in wb.rows('Meterials (All Brands)').items() if r >= 12 and v.get(2)}
    mats = []
    for r, v in sorted(wb.rows('Material Mapping (Excel)').items()):
        if r < 9 or not v.get(1):
            continue
        legacy = s(v[1])
        c, a = crosswalk.get(legacy, {}), brands.get(legacy, {})
        mats.append(dict(
            id=s(c.get(2)) or legacy, legacy=legacy, name=s(v.get(2)),
            curCat=s(v.get(3)), curCatId=s(v.get(4)), code=s(v.get(5)),
            grp=s(v.get(6)), p1=s(v.get(7)), p2=s(v.get(8)), p3=s(v.get(9)),
            catTh=s(v.get(10)), st=s(v.get(11)), note=s(v.get(12)),
            idChange=s(c.get(4)), bible=s(c.get(9)), flag=s(c.get(10)),
            desc=s(a.get(9)), kind=s(a.get(10)), unit=s(a.get(23)), temp=s(a.get(44)),
            br=[b for b, i in zip(BRANDS, [13, 14, 15, 16]) if flag(a.get(i))],
        ))
    bible = []
    for r, v in sorted(wb.rows('Material Master Bible').items()):
        if r < 16 or not v.get(7):
            continue
        bible.append(dict(grp=s(v.get(1)), p1=s(v.get(2)), p2=s(v.get(3)), th=s(v.get(4)), p3=s(v.get(5)),
                          th3=s(v.get(6)), code=s(v.get(7)), lvl=int(num(v.get(8)) or 0),
                          n=int(num(v.get(9)) or 0), pend=int(num(v.get(10)) or 0)))
    return mats, bible


def export_skus(path):
    wb = Workbook(path)
    skus = []
    for r, v in sorted(wb.rows('Selling SKU Master').items()):
        if r < 10 or not v.get(2):
            continue
        skus.append(dict(
            key=s(v[2]), en=s(v.get(3)), th=s(v.get(4)), l1=s(v.get(5)), l2=s(v.get(6)), l2th=s(v.get(7)),
            l3=s(v.get(8)), l3th=s(v.get(9)), code=s(v.get(10)), bmc=s(v.get(11)), bms=s(v.get(12)),
            note=s(v.get(13)), br=[b for b, i in zip(BRANDS, [14, 15, 16, 17]) if flag(v.get(i))],
        ))
    mapping = {}
    for r, v in wb.rows('SKU–Store Mapping').items():
        if r < 4 or not v.get(0):
            continue
        mapping[s(v[0])] = dict(
            brand=s(v.get(2)), store=s(v.get(3)), posCode=s(v.get(4)), posId=s(v.get(5)).replace('.0', ''),
            label=s(v.get(6)), grp=s(v.get(7)), cat=s(v.get(8)), price=num(v.get(9)), status=s(v.get(10)),
            date=s(v.get(13)))
    for sku in skus:
        m = mapping.get(sku['key'], {})
        for k in ('store', 'posCode', 'posId', 'label', 'grp', 'cat', 'price', 'status', 'date', 'brand'):
            sku[k] = m.get(k)
        if not sku['brand']:
            sku['brand'] = sku['key'].split(':')[0]
    cats = [[s(v.get(i)) for i in range(9)]
            for r, v in sorted(wb.rows('SKU Categories').items()) if r >= 4 and v.get(0)]
    bmc = [[s(v.get(i)) for i in range(7)]
           for r, v in sorted(wb.rows('Brand Menu Categories').items()) if r >= 4 and v.get(0)]
    return skus, cats, bmc


def main():
    root = Path(__file__).resolve().parent.parent
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--data', type=Path, default=root / 'Data')
    ap.add_argument('--out', type=Path, default=root / 'prototype' / 'data.json')
    args = ap.parse_args()
    mats, bible = export_materials(args.data / MATERIAL_FILE)
    skus, cats, bmc = export_skus(args.data / SKU_FILE)
    args.out.write_text(json.dumps(dict(mats=mats, bible=bible, skus=skus, cats=cats, bmc=bmc),
                                   ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    active = [m for m in mats if m['st'] != 'ยกเลิก']
    print(f'materials {len(mats)} (active {len(active)}) · bible {len(bible)} · '
          f'skus {len(skus)} · sku categories {len(cats)} · brand menu categories {len(bmc)}')
    print(f'wrote {args.out}')


if __name__ == '__main__':
    main()
