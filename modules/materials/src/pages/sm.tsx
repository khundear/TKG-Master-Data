// /materials/sm — semi-finished items the central kitchen makes (prototype matSM()).
import { _t } from '@tkg/i18n';
import { Card, PER_PAGE, PageHeader, Pager } from '@tkg/ui';
import { MaterialTable } from '../components/material-table';
import { smMaterials } from '../queries';
import { crumbs } from './common';

export async function MaterialSmPage() {
  const rows = await smMaterials();
  return (
    <>
      <PageHeader
        title={_t('ของผลิตเอง (ครัวกลาง)')}
        description={_t('รายการกึ่งสำเร็จรูป (SM) ที่ครัวกลางผลิตเอง อยู่นอกขอบเขต RM/SP ของ Bible จึงแยกไว้ที่นี่')}
        crumbs={crumbs(_t('ของผลิตเอง'))}
      />
      <Card>
        <MaterialTable rows={rows} />
        <Pager total={rows.length} page={1} perPage={Math.max(rows.length, PER_PAGE)} />
      </Card>
    </>
  );
}
