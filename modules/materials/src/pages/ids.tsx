// /materials/ids — changed Material IDs; the legacy ID is kept for tracing (prototype matIds()).
import { _t } from '@tkg/i18n';
import { Card, PageHeader, Pager, Tag, fmt } from '@tkg/ui';
import { MaterialTable } from '../components/material-table';
import { changedIds } from '../queries';
import { crumbs, pageNumber, type SearchParams } from './common';

export async function MaterialIdsPage({ searchParams }: { searchParams: SearchParams }) {
  const { rows, total, all, page } = await changedIds(pageNumber((await searchParams).page));
  return (
    <>
      <PageHeader
        title={_t('รหัสเก่า–ใหม่')}
        description={_t('รายการที่เปลี่ยนรหัสตามหมวดที่ยืนยันแล้ว เก็บรหัสเดิมไว้เพื่อย้อนตรวจและเชื่อมข้อมูลเก่า')}
        crumbs={crumbs(_t('รหัสเก่า–ใหม่'))}
        actions={<Tag>{_t('{n} จาก {all} รายการเปลี่ยนรหัส', { n: fmt(total), all: fmt(all) })}</Tag>}
      />
      <Card>
        <MaterialTable rows={rows} variant="ids" />
        <Pager total={total} page={page} hrefFor={(p) => (p > 1 ? `/materials/ids?page=${p}` : '/materials/ids')} />
      </Card>
    </>
  );
}
