// Small display helpers shared by the SKU pages. No hooks: usable from server and client components.
import type { ReactNode } from 'react';
import { _t } from '@tkg/i18n';
import { StatusChip } from '@tkg/ui';
import { SALES_STATUS } from '../params';
import type { SkuRow } from '../types';

/** POS snapshot status. Short label in tables (งดขาย), full label in the drawer. Never an approval. */
export function SalesStatusChip({ status, long }: { status: string | null; long?: boolean }) {
  if (status === SALES_STATUS.ready) return <StatusChip tone="ok">{_t('พร้อมขาย')}</StatusChip>;
  if (status === SALES_STATUS.paused) return <StatusChip tone="warn">{long ? _t('งดขายชั่วคราว') : _t('งดขาย')}</StatusChip>;
  if (!status) return <Dash />;
  return <StatusChip tone="mute">{status}</StatusChip>;
}

export const Dash = () => <span style={{ color: 'var(--ink-4)' }}>—</span>;

export const Warn = ({ children }: { children: ReactNode }) => <span style={{ color: 'var(--warn)' }}>{children}</span>;

/** Menu name: English as the sheet has it, Thai under it. Many SKUs have Thai only. */
export function SkuName({ sku }: { sku: Pick<SkuRow, 'nameEn' | 'nameTh'> }) {
  if (!sku.nameEn) return <>{sku.nameTh ?? <Dash />}</>;
  return (
    <>
      {sku.nameEn}
      {sku.nameTh ? <span className="t2">{sku.nameTh}</span> : null}
    </>
  );
}

/** Brand code badge with the brand name next to it. */
export const BrandBadge = ({ code, name }: { code: string; name?: string }) => (
  <>
    <span className="bc">{code}</span>
    {name}
  </>
);
