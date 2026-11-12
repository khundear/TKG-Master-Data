// SKU (Selling) module shell: top bar + left menu (prototype skuNav()). Pages live in @tkg/sku-selling.
import type { ReactNode } from 'react';
import { ModuleShell } from '@tkg/ui';
import { getNavCounts, skuNav } from '@tkg/sku-selling';
import '@tkg/sku-selling/sku.css';
import { _t } from '../../../lib/i18n';
import { demoUser } from '../../../lib/user';
import { SkuRouter } from './sku-router';

export const dynamic = 'force-dynamic';

export default async function SkuLayout({ children }: { children: ReactNode }) {
  const counts = await getNavCounts();
  return (
    <SkuRouter>
      <ModuleShell
        moduleName="SKU (Selling)"
        nav={skuNav(counts)}
        navLabel={_t('เมนู SKU')}
        user={demoUser()}
        badge={_t('ข้อมูลร่าง · รออนุมัติ')}
      >
        {children}
      </ModuleShell>
    </SkuRouter>
  );
}
