'use client';
import { useMemo, useState } from 'react';
import {
  BrandCodes,
  Button,
  Card,
  DataTable,
  Drawer,
  DrawerSection,
  FilterPills,
  KeyValues,
  MetricCard,
  Metrics,
  ModuleShell,
  Note,
  PER_PAGE,
  PageHeader,
  Pager,
  SearchBox,
  StatusChip,
  Tag,
  TogglePill,
  Toolbar,
  fmt,
  type ChipTone,
  type NavSection,
} from '@tkg/ui';
import { _t } from '../../lib/i18n';
import { demoUser } from '../../lib/user';

export interface KitMaterial {
  code: string;
  legacyCode: string;
  idChange: string | null;
  name: string;
  description: string | null;
  group: string | null;
  primary: string | null;
  secondary: string | null;
  tertiary: string | null;
  categoryTh: string | null;
  currentCategory: string | null;
  mappingStatus: string;
  unit: string | null;
  brands: string[];
  sourceSheet: string;
  sourceRow: number;
}

const STATUS: Record<string, [ChipTone, string]> = {
  ตรงกัน: ['ok', 'หมวดตรงกัน'],
  ย้ายหมวด: ['info', 'ย้ายหมวด'],
  ต้องตัดสินใจ: ['warn', 'รอตัดสินใจ'],
  'คงไว้เป็น SM': ['mute', 'SM'],
  ยกเลิก: ['bad', 'ยกเลิก'],
};
const chip = (st: string) => {
  const [tone, label] = STATUS[st] ?? ['mute', st];
  return <StatusChip tone={tone}>{_t(label)}</StatusChip>;
};

export function KitDemo({
  materials,
  stats,
  brands,
}: {
  materials: KitMaterial[];
  stats: { total: number; cancelled: number; changed: number; none: number };
  brands: { code: string; name: string; count: number }[];
}) {
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [pork, setPork] = useState(false);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<KitMaterial | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return materials.filter(
      (m) =>
        (!brand || m.brands.includes(brand)) &&
        (!pork || m.secondary === 'PORK' || /หมู|เบคอน|แฮม|bacon|pork/i.test(m.name)) &&
        (!s || [m.code, m.legacyCode, m.name, m.categoryTh ?? ''].some((x) => x.toLowerCase().includes(s))),
    );
  }, [materials, q, brand, pork]);
  const rows = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const nav: NavSection[] = [
    { items: [{ href: '/ui-kit', label: _t('ภาพรวม'), icon: 'home' }] },
    {
      heading: _t('เมนูตัวอย่าง'),
      items: [
        { href: '/ui-kit#list', label: _t('รายการ Material'), icon: 'box', count: stats.total },
        { href: '/ui-kit#brands', label: _t('การใช้ตามแบรนด์'), icon: 'chart' },
        { href: '/ui-kit#none', label: _t('ยังไม่ระบุแบรนด์'), icon: 'warn', count: stats.none, warn: true },
      ],
    },
    { footer: true, items: [{ href: '/ui-kit#config', label: _t('ตั้งค่า'), icon: 'gear' }] },
  ];

  return (
    <ModuleShell moduleName={_t('ชุดชิ้นส่วน UI')} nav={nav} navLabel={_t('เมนูตัวอย่าง')} user={demoUser()} badge={_t('ข้อมูลร่าง · รออนุมัติ')}>
      <PageHeader
        title={_t('ชุดชิ้นส่วน UI')}
        description={_t('ชิ้นส่วนกลางจาก packages/ui ทุกชิ้นบนข้อมูลจริง ใช้อ้างอิงตอนสร้างหน้าในโมดูล')}
        crumbs={[{ label: 'TKG', href: '/' }, { label: _t('ชุดชิ้นส่วน UI') }]}
        actions={<Tag>{_t('ร่าง')}</Tag>}
      />
      <Metrics>
        <MetricCard label={_t('Material ทั้งหมด')} value={fmt(stats.total)} sub={_t('ไม่นับยกเลิก {n} รายการ', { n: stats.cancelled })} href="/ui-kit#list" />
        <MetricCard label={_t('รหัสเปลี่ยน')} value={fmt(stats.changed)} sub={_t('เก็บรหัสเดิมไว้ย้อนตรวจ')} />
        <MetricCard label={_t('ยังไม่ระบุแบรนด์')} value={fmt(stats.none)} sub={_t('ยังไม่ระบุ ไม่ใช่ห้ามใช้')} warn />
      </Metrics>
      <Note tone="info">{_t('ข้อมูลนำเข้าจากไฟล์ Excel ทั้งหมดยังเป็นฉบับร่าง รอการตรวจและอนุมัติ')}</Note>
      <Card>
        <Toolbar>
          <SearchBox label={_t('ค้นหา')} placeholder={_t('ค้นหารหัส ชื่อ หรือหมวด')} value={q} onChange={(v) => { setQ(v); setPage(1); }} />
          <FilterPills
            label={_t('แบรนด์')}
            value={brand}
            onChange={(v) => { setBrand(v); setPage(1); }}
            options={[{ value: '', label: _t('ทั้งหมด') }, ...brands.map((b) => ({ value: b.code, label: b.code, count: b.count }))]}
          />
          <TogglePill on={pork} onToggle={() => { setPork(!pork); setPage(1); }}>
            {_t('มีหมู')}
          </TogglePill>
        </Toolbar>
        <DataTable
          rows={rows}
          rowKey={(m) => m.legacyCode}
          onRowClick={setOpen}
          columns={[
            {
              key: 'code',
              header: _t('รหัส Material'),
              className: 'mono',
              render: (m) => (
                <>
                  {m.code}
                  {m.code !== m.legacyCode ? <span className="t2">{_t('เดิม {code}', { code: m.legacyCode })}</span> : null}
                </>
              ),
            },
            { key: 'name', header: _t('ชื่อ'), style: { minWidth: 220 }, render: (m) => <>{m.name}{m.description ? <span className="t2">{m.description}</span> : null}</> },
            { key: 'cat', header: _t('หมวด'), style: { minWidth: 180 }, render: (m) => <>{m.categoryTh ?? m.currentCategory}<span className="t2">{[m.group, m.secondary, m.tertiary].filter(Boolean).join(' / ')}</span></> },
            { key: 'brands', header: _t('แบรนด์ที่ใช้'), style: { whiteSpace: 'nowrap' }, render: (m) => <BrandCodes brands={m.brands} showAll /> },
            { key: 'unit', header: _t('หน่วย'), render: (m) => m.unit ?? <span style={{ color: 'var(--ink-4)' }}>—</span> },
            { key: 'st', header: _t('สถานะหมวด'), render: (m) => chip(m.mappingStatus) },
          ]}
        />
        <Pager total={list.length} page={page} onPage={(p) => { setPage(p); window.scrollTo(0, 0); }} />
      </Card>
      <Drawer
        open={!!open}
        onClose={() => setOpen(null)}
        code={open?.code}
        title={open?.name}
        chips={open ? <>{chip(open.mappingStatus)}<Tag>{_t('ร่าง')}</Tag></> : null}
        footer={<><Button icon="clock">{_t('ประวัติ')}</Button><Button primary>{_t('ขอแก้ไขข้อมูล')}</Button></>}
      >
        {open ? (
          <>
            <DrawerSection title={_t('ข้อมูลหลัก')}>
              <KeyValues
                items={[
                  [_t('รหัสปัจจุบัน'), <span key="c" className="mono" style={{ color: 'var(--ink)' }}>{open.code}</span>],
                  [_t('รหัสเดิม'), open.legacyCode !== open.code ? `${open.legacyCode} · ${open.idChange ?? ''}` : _t('ไม่เปลี่ยน')],
                ]}
              />
            </DrawerSection>
            <DrawerSection title={_t('แบรนด์ที่ใช้')}>
              <BrandCodes brands={open.brands} showAll />
              <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>{_t('ช่องที่เป็นเส้นประ = ยังไม่ระบุ ไม่ใช่ห้ามใช้')}</p>
            </DrawerSection>
            <DrawerSection title={_t('ที่มา')} last>
              <KeyValues items={[[_t('ที่มา'), _t('ชีต {sheet} แถว {row}', { sheet: open.sourceSheet, row: open.sourceRow })]]} />
            </DrawerSection>
          </>
        ) : null}
      </Drawer>
    </ModuleShell>
  );
}
