'use client';
// รหัส POS (prototype skuPos()): one row per POS mapping. Each POS code points (↔) at the temporary reference key (Master Record Key); it is not the ID.
import { useCallback, useState } from 'react';
import { _t } from '@tkg/i18n';
import { DataTable, EmptyState, FilterPills, Pager, SearchBox, Toolbar } from '@tkg/ui';
import { buildHref, type PosFilters } from '../params';
import type { PosRow, SkuRow } from '../types';
import { Dash } from './bits';
import { useNavigate } from './navigate';
import { SkuDrawer } from './sku-drawer';
import { useUrlSearch } from './sku-filters';

const POS_PATH = '/sku/pos';
const posHref = (f: Partial<PosFilters>) => buildHref(POS_PATH, { br: f.br, q: f.q, page: f.page });

export function PosView({
  f,
  rows,
  total,
  page,
  brands,
}: {
  f: PosFilters;
  rows: PosRow[];
  total: number;
  page: number;
  brands: { code: string; name: string }[];
}) {
  const [open, setOpen] = useState<SkuRow | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const { pending } = useNavigate();
  const search = useUrlSearch(f.q, (q) => posHref({ ...f, q, page: 1 }));
  return (
    <>
      <FilterPills
        label={_t('เลือกแบรนด์')}
        value={f.br}
        hrefFor={(br) => posHref({ ...f, br, page: 1 })}
        options={[{ value: '', label: _t('ทุกแบรนด์') }, ...brands.map((b) => ({ value: b.code, label: `${b.code} · ${b.name}` }))]}
      />
      <section className="card">
        <Toolbar>
          <SearchBox
            label={_t('ค้นหารหัส POS')}
            placeholder={_t('ค้นหารหัสอ้างอิง, POS ID หรือชื่อใน POS')}
            value={search.q}
            onChange={search.onChange}
          />
        </Toolbar>
        <div style={{ opacity: pending ? 0.55 : 1, transition: 'opacity .15s' }} aria-busy={pending}>
          <DataTable
            rows={rows}
            rowKey={(r) => r.id}
            onRowClick={(r) => setOpen(r.sku)}
            empty={
              <EmptyState icon="search" title={_t('ไม่พบรหัส POS')}>
                {_t('ลองเปลี่ยนคำค้นหรือล้างตัวกรอง')}
              </EmptyState>
            }
            columns={[
              { key: 'key', header: _t('รหัสอ้างอิงชั่วคราว'), className: 'mono', style: { color: 'var(--ink)' }, render: (r) => r.key },
              {
                key: 'map',
                header: <span className="sr-only">{_t('จับคู่กับ')}</span>,
                style: { color: 'var(--ink-4)' },
                render: () => <span title={_t('จับคู่กับ')}>↔</span>,
              },
              { key: 'id', header: _t('POS Internal ID'), className: 'mono', render: (r) => r.posInternalId ?? <Dash /> },
              { key: 'code', header: _t('POS SKU Code'), className: 'mono', render: (r) => r.posSkuCode ?? <Dash /> },
              { key: 'label', header: _t('ชื่อใน POS'), style: { minWidth: 200 }, render: (r) => r.posLabel ?? <Dash /> },
              {
                key: 'grp',
                header: _t('กลุ่ม / หมวดใน POS'),
                style: { minWidth: 140 },
                render: (r) => (
                  <>
                    {r.posGroup ?? <Dash />}
                    {r.posCategory ? <span className="t2">{r.posCategory}</span> : null}
                  </>
                ),
              },
              { key: 'store', header: _t('สาขา'), style: { whiteSpace: 'nowrap' }, render: (r) => r.store },
            ]}
          />
        </div>
        <Pager total={total} page={page} hrefFor={(p) => posHref({ ...f, page: p })} />
      </section>
      <SkuDrawer sku={open} onClose={close} />
    </>
  );
}
