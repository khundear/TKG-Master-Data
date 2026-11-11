// /materials/list — the material list with filters in the URL (prototype matList()).
import { _t } from '@tkg/i18n';
import { Button, Card, PageHeader, Pager } from '@tkg/ui';
import { BrandPills, ListFilters } from '../components/list-filters';
import { MaterialTable } from '../components/material-table';
import { listHref, parseFilter } from '../filters';
import { listMaterials } from '../queries';
import { crumbs, type SearchParams } from './common';

export async function MaterialListPage({ searchParams }: { searchParams: SearchParams }) {
  const filter = parseFilter(await searchParams);
  const { rows, total, page, primaryOptions } = await listMaterials(filter);
  return (
    <>
      <PageHeader
        title={_t('รายการ Material')}
        description={_t('ค้นหาจากรหัส ชื่อ หรือรหัสเดิม คลิกแถวเพื่อดูรายละเอียด')}
        crumbs={crumbs(_t('รายการ Material'))}
        actions={
          <>
            <Button href="/materials/io" icon="dl">
              {_t('ส่งออก')}
            </Button>
            <Button href="/materials/approve" icon="plus" primary>
              {_t('ขอเพิ่ม Material')}
            </Button>
          </>
        }
      />
      <BrandPills filter={filter} />
      <Card>
        <ListFilters filter={filter} primaryOptions={primaryOptions} />
        <MaterialTable rows={rows} />
        <Pager total={total} page={page} hrefFor={(p) => listHref({ ...filter, page: p })} />
      </Card>
    </>
  );
}
