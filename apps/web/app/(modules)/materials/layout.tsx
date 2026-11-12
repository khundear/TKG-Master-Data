// Materials module shell: top bar + left menu (docs/AGENTS.md session 2; pages and logic in modules/materials).
import type { ReactNode } from 'react';
import { materialsNav, navCounts } from '@tkg/materials';
import '@tkg/materials/styles.css';
import { ModuleShell } from '@tkg/ui';
import { _t } from '../../../lib/i18n';
import { demoUser } from '../../../lib/user';
import { RouterBridge } from './router-bridge';

export const dynamic = 'force-dynamic';

export default async function MaterialsLayout({ children }: { children: ReactNode }) {
  const nav = materialsNav(await navCounts());
  return (
    <ModuleShell moduleName="Materials" nav={nav} navLabel={_t('เมนู Materials')} user={demoUser()} badge={_t('ข้อมูลร่าง · รออนุมัติ')}>
      <RouterBridge>{children}</RouterBridge>
    </ModuleShell>
  );
}
