'use client';
// Material tables (prototype matTable(), the review table and the ID table). A row opens the detail drawer.
import { useCallback, useState } from 'react';
import { _t } from '@tkg/i18n';
import { BrandCodes, DataTable, EmptyState, StatusChip, type Column } from '@tkg/ui';
import { brandNames, primaryName, statusChip, unitShort } from '../labels';
import type { MaterialRow } from '../types';
import { MaterialDrawer } from './material-drawer';

export type TableVariant = 'list' | 'review' | 'ids';

const dash = <span style={{ color: 'var(--ink-4)' }}>—</span>;

function listColumns(): Column<MaterialRow>[] {
  const names = brandNames();
  return [
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
    {
      key: 'name',
      header: _t('ชื่อ'),
      style: { minWidth: 220 },
      render: (m) => (
        <>
          {m.name}
          {m.description ? <span className="t2">{m.description}</span> : null}
        </>
      ),
    },
    {
      key: 'cat',
      header: _t('หมวด'),
      style: { minWidth: 180 },
      render: (m) =>
        m.primary ? (
          <>
            {primaryName(m.primary)}
            <span className="t2">{[m.group, m.secondary, m.tertiary].filter(Boolean).join(' / ')}</span>
          </>
        ) : (
          <span style={{ color: 'var(--ink-3)' }}>{m.currentCategory}</span>
        ),
    },
    { key: 'brands', header: _t('แบรนด์ที่ใช้'), style: { whiteSpace: 'nowrap' }, render: (m) => <BrandCodes brands={m.brands} showAll names={names} /> },
    { key: 'unit', header: _t('หน่วย'), style: { whiteSpace: 'nowrap' }, render: (m) => (m.unitLabel ? unitShort(m.unitLabel) : dash) },
    {
      key: 'st',
      header: _t('สถานะหมวด'),
      render: (m) => {
        const [tone, label] = statusChip(m.mappingStatus);
        return <StatusChip tone={tone}>{label}</StatusChip>;
      },
    },
  ];
}

function reviewColumns(): Column<MaterialRow>[] {
  return [
    { key: 'code', header: _t('รหัส Material'), className: 'mono', render: (m) => m.code },
    { key: 'name', header: _t('ชื่อ'), style: { minWidth: 200 }, render: (m) => m.name },
    {
      key: 'cur',
      header: _t('หมวดปัจจุบัน'),
      style: { whiteSpace: 'nowrap' },
      render: (m) => (
        <>
          {m.currentCategory}
          <span className="t2 mono">{m.currentCategoryCode}</span>
        </>
      ),
    },
    {
      key: 'new',
      header: _t('หมวดที่เสนอ'),
      style: { minWidth: 180 },
      render: (m) =>
        m.proposedCode ? (
          <>
            {m.categoryTh}
            <span className="t2 mono">{m.proposedCode}</span>
          </>
        ) : (
          <span style={{ color: 'var(--warn)' }}>{_t('ยังไม่มีหมวดรองรับ')}</span>
        ),
    },
    { key: 'note', header: _t('หมายเหตุ'), style: { minWidth: 200, color: 'var(--ink-2)' }, render: (m) => m.note || '—' },
  ];
}

function idColumns(): Column<MaterialRow>[] {
  return [
    { key: 'old', header: _t('รหัสเดิม'), className: 'mono', style: { textDecoration: 'line-through', color: 'var(--ink-3)' }, render: (m) => m.legacyCode },
    { key: 'arrow', header: <span className="sr-only">{_t('เปลี่ยนเป็น')}</span>, style: { color: 'var(--ink-4)' }, render: () => '→' },
    { key: 'new', header: _t('รหัสปัจจุบัน'), className: 'mono', style: { color: 'var(--ink)' }, render: (m) => m.code },
    { key: 'name', header: _t('ชื่อ'), render: (m) => m.name },
    { key: 'cat', header: _t('หมวด'), render: (m) => m.categoryTh ?? dash },
  ];
}

export function MaterialTable({ rows, variant = 'list' }: { rows: MaterialRow[]; variant?: TableVariant }) {
  const [open, setOpen] = useState<MaterialRow | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const columns = variant === 'review' ? reviewColumns() : variant === 'ids' ? idColumns() : listColumns();
  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(m) => m.legacyCode}
        onRowClick={setOpen}
        empty={
          <EmptyState icon="search" title={_t('ไม่พบ Material')}>
            {_t('ลองเปลี่ยนคำค้นหรือล้างตัวกรอง')}
          </EmptyState>
        }
      />
      <MaterialDrawer material={open} onClose={close} />
    </>
  );
}
