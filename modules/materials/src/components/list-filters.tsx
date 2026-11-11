'use client';
// Filter bar of the material list (prototype matList()). Every change writes the URL, so filters can be linked to.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { _t } from '@tkg/i18n';
import { FilterPills, Icon, SearchBox, Select, TogglePill, Toolbar, UiLink } from '@tkg/ui';
import { hasFilter, listHref, type MaterialFilter } from '../filters';
import { BRAND_CODES, MAPPING_STATUSES, brandName, groupName, primaryName, statusChip } from '../labels';
import { useNavigate } from '../navigate';

/** Brand pills, above the card as in the prototype. Links, so they work before scripts load. */
export function BrandPills({ filter }: { filter: MaterialFilter }) {
  return (
    <FilterPills
      label={_t('เลือกแบรนด์')}
      value={filter.br}
      hrefFor={(br) => listHref({ ...filter, br: br as MaterialFilter['br'], page: 1 })}
      options={[
        { value: '', label: _t('ทุกแบรนด์') },
        ...BRAND_CODES.map((c) => ({ value: c, label: `${c} · ${brandName(c)}` })),
        { value: 'multi', label: _t('ใช้ร่วม 2+') },
        { value: 'none', label: _t('ยังไม่ระบุ') },
      ]}
    />
  );
}

function ClearPill({ href, children }: { href: string; children: ReactNode }) {
  return (
    <UiLink className="pill on" href={href} aria-label={_t('ล้างตัวกรองนี้')}>
      {children}
      <Icon name="x" size={14} />
    </UiLink>
  );
}

export function ListFilters({ filter, primaryOptions }: { filter: MaterialFilter; primaryOptions: string[] }) {
  const navigate = useNavigate();
  const go = (patch: Partial<MaterialFilter>, replace = false) => navigate(listHref({ ...filter, ...patch, page: 1 }), { replace });

  // Search: typed text is kept locally and written to the URL after a short pause.
  const [q, setQ] = useState(filter.q);
  const typed = useRef(false);
  useEffect(() => {
    typed.current = false;
    setQ(filter.q);
  }, [filter.q]);
  useEffect(() => {
    if (!typed.current || q.trim() === filter.q) return;
    const t = setTimeout(() => go({ q: q.trim() }, true), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <Toolbar>
      <SearchBox
        label={_t('ค้นหา Material')}
        placeholder={_t('ค้นหารหัส ชื่อ หรือหมวด')}
        value={q}
        onChange={(v) => {
          typed.current = true;
          setQ(v);
        }}
      />
      <Select
        label={_t('กลุ่ม')}
        value={filter.grp}
        onChange={(v) => go({ grp: v as MaterialFilter['grp'], p1: '' })}
        options={[{ value: '', label: _t('ทุกกลุ่ม') }, ...(['RM', 'SP', 'SM'] as const).map((g) => ({ value: g, label: `${g} · ${groupName(g)}` }))]}
      />
      <Select
        label={_t('หมวดหลัก')}
        value={filter.p1}
        onChange={(v) => go({ p1: v })}
        options={[
          { value: '', label: _t('ทุกหมวดหลัก') },
          ...(filter.p1 && !primaryOptions.includes(filter.p1) ? [filter.p1] : []).concat(primaryOptions).map((p) => ({
            value: p,
            label: `${primaryName(p)} · ${p}`,
          })),
        ]}
      />
      <Select
        label={_t('สถานะหมวด')}
        value={filter.st}
        onChange={(v) => go({ st: v })}
        options={[{ value: '', label: _t('ทุกสถานะ (ไม่รวมยกเลิก)') }, ...MAPPING_STATUSES.map((s) => ({ value: s, label: statusChip(s)[1] }))]}
      />
      <TogglePill on={filter.pork} onToggle={() => go({ pork: !filter.pork })} title={_t('Material ที่มีหมู ใช้กรองสำหรับแบรนด์/เมนูที่ไม่ใช้หมู')}>
        {_t('มีหมู')}
      </TogglePill>
      {filter.bible ? <ClearPill href={listHref({ ...filter, bible: '', page: 1 })}>{_t('หมวด {code}', { code: filter.bible })}</ClearPill> : null}
      {filter.unit ? (
        <ClearPill href={listHref({ ...filter, unit: '', page: 1 })}>
          {_t('หน่วย {unit}', { unit: filter.unit === 'none' ? _t('ยังไม่ระบุ') : filter.unit })}
        </ClearPill>
      ) : null}
      {hasFilter(filter) ? (
        <span style={{ marginLeft: 'auto' }}>
          <UiLink className="lnk" href={listHref()}>
            {_t('ล้างตัวกรอง')}
          </UiLink>
        </span>
      ) : null}
    </Toolbar>
  );
}
