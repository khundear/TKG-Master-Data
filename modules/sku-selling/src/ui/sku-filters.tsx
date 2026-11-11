'use client';
// Filter bar of รายการ SKU (prototype skuList()). Every filter is in the URL; the server page reads it.
import { useEffect, useRef, useState } from 'react';
import { _t } from '@tkg/i18n';
import { FilterPills, Icon, SearchBox, Select, Toolbar } from '@tkg/ui';
import { NONE, SALES_STATUS, hasActiveFilters, listHref, patchFilters, type Gap, type SkuListFilters } from '../params';
import { useNavigate } from './navigate';

export function gapLabel(gap: Gap): string {
  switch (gap) {
    case 'note':
      return _t('มีหมายเหตุรอยืนยัน');
    case 'price':
      return _t('ไม่มีราคา');
    case 'l1':
      return _t('ไม่มีประเภท');
    case 'pos':
      return _t('ไม่มี POS SKU Code');
  }
}

/** Search box that updates the URL shortly after typing stops. */
export function useUrlSearch(initial: string, hrefFor: (q: string) => string) {
  const { go } = useNavigate();
  const [q, setQ] = useState(initial);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const last = useRef(initial);
  // Follow the URL when it changes from outside (e.g. ล้างตัวกรอง), not while the user is typing.
  useEffect(() => {
    if (initial !== last.current) {
      last.current = initial;
      setQ(initial);
    }
  }, [initial]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onChange = (v: string) => {
    setQ(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      last.current = v.trim();
      go(hrefFor(v.trim()), { replace: true });
    }, 250);
  };
  return { q, onChange };
}

export function SkuBrandPills({
  f,
  brands,
  allCount,
}: {
  f: SkuListFilters;
  brands: { code: string; name: string; count: number }[];
  allCount: number;
}) {
  return (
    <FilterPills
      label={_t('เลือกแบรนด์')}
      value={f.br}
      hrefFor={(br) => listHref(patchFilters(f, { br }))}
      options={[
        { value: '', label: _t('ทุกแบรนด์'), count: allCount },
        ...brands.map((b) => ({ value: b.code, label: `${b.code} · ${b.name}`, count: b.count })),
      ]}
    />
  );
}

export function SkuFilterBar({ f, l1Options, l2Options }: { f: SkuListFilters; l1Options: string[]; l2Options: string[] }) {
  const { go } = useNavigate();
  const search = useUrlSearch(f.q, (q) => listHref(patchFilters(f, { q })));
  const set = (patch: Partial<SkuListFilters>) => go(listHref(patchFilters(f, patch)));
  const l2 = f.l2 && !l2Options.includes(f.l2) ? [f.l2, ...l2Options] : l2Options;
  return (
    <Toolbar>
      <SearchBox
        label={_t('ค้นหา SKU')}
        placeholder={_t('ค้นหาชื่อเมนู รหัส TKG หรือรหัส POS')}
        value={search.q}
        onChange={search.onChange}
      />
      <Select
        label={_t('ประเภท')}
        value={f.l1}
        onChange={(l1) => set({ l1 })}
        options={[
          { value: '', label: _t('ทุกประเภท') },
          ...l1Options.map((v) => ({ value: v, label: v === NONE ? _t('ยังไม่ระบุ') : v })),
        ]}
      />
      <Select
        label={_t('หมวดกลาง')}
        value={f.l2}
        onChange={(v) => set({ l2: v })}
        options={[{ value: '', label: _t('ทุกหมวดกลาง') }, ...l2.map((v) => ({ value: v, label: v }))]}
      />
      <Select
        label={_t('สถานะ')}
        value={f.status}
        onChange={(status) => set({ status })}
        options={[
          { value: '', label: _t('ทุกสถานะ') },
          { value: SALES_STATUS.ready, label: _t('พร้อมขาย') },
          { value: SALES_STATUS.paused, label: _t('งดขายชั่วคราว') },
        ]}
      />
      {f.gap ? (
        <button className="pill on" onClick={() => set({ gap: '' })} aria-label={_t('เอาตัวกรอง {name} ออก', { name: gapLabel(f.gap) })}>
          {gapLabel(f.gap)} <Icon name="x" size={14} />
        </button>
      ) : null}
      {hasActiveFilters(f) ? (
        <button className="lnk" style={{ marginLeft: 'auto' }} onClick={() => go(listHref())}>
          {_t('ล้างตัวกรอง')}
        </button>
      ) : null}
    </Toolbar>
  );
}
