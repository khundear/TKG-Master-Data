'use client';
// SKU table (prototype skuTable()): 50 per page, pager links keep the filters, a row opens the detail drawer.
import { useCallback, useState } from 'react';
import { _t } from '@tkg/i18n';
import { DataTable, EmptyState, Pager, money } from '@tkg/ui';
import { buildHref } from '../params';
import type { SkuRow } from '../types';
import { Dash, SalesStatusChip, SkuName, Warn } from './bits';
import { SkuDrawer } from './sku-drawer';
import { useNavigate } from './navigate';

export function SkuTable({
  rows,
  total,
  page,
  path,
  query = {},
}: {
  rows: SkuRow[];
  total: number;
  page: number;
  /** Page path and the filters to keep in pager links. */
  path: string;
  query?: Record<string, string>;
}) {
  const [open, setOpen] = useState<SkuRow | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const { pending } = useNavigate();
  return (
    <>
      <div style={{ opacity: pending ? 0.55 : 1, transition: 'opacity .15s' }} aria-busy={pending}>
        <DataTable
          rows={rows}
          rowKey={(s) => s.key}
          onRowClick={setOpen}
          empty={
            <EmptyState icon="search" title={_t('ไม่พบ SKU')}>
              {_t('ลองเปลี่ยนคำค้นหรือล้างตัวกรอง')}
            </EmptyState>
          }
          columns={[
            { key: 'key', header: _t('รหัส TKG'), className: 'mono', render: (s) => s.key },
            { key: 'name', header: _t('ชื่อเมนู'), style: { minWidth: 240 }, render: (s) => <SkuName sku={s} /> },
            { key: 'brand', header: _t('แบรนด์'), render: (s) => <span className="bc">{s.brand}</span> },
            {
              key: 'l2',
              header: _t('หมวดกลาง'),
              style: { minWidth: 170 },
              render: (s) => (
                <>
                  {s.l2Th ?? <Warn>{_t('ยังไม่ระบุ')}</Warn>}
                  {s.l3Th ? <span className="t2">{s.l3Th}</span> : null}
                </>
              ),
            },
            {
              key: 'bmc',
              header: _t('หมวดเมนูแบรนด์'),
              style: { minWidth: 140 },
              render: (s) => (
                <>
                  {s.brandMenuCategory ?? <Dash />}
                  {s.brandMenuSubcategory ? <span className="t2">{s.brandMenuSubcategory}</span> : null}
                </>
              ),
            },
            { key: 'price', header: _t('ราคา (บาท)'), className: 'r num', render: (s) => money(s.price) },
            { key: 'st', header: _t('สถานะ'), render: (s) => <SalesStatusChip status={s.salesStatus} /> },
          ]}
        />
      </div>
      <Pager total={total} page={page} hrefFor={(p) => buildHref(path, { ...query, page: p })} />
      <SkuDrawer sku={open} onClose={close} />
    </>
  );
}
