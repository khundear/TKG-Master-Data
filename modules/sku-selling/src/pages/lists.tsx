// รายการ SKU, งดขายชั่วคราว and รหัส POS: paged lists whose rows open the SKU drawer.
import { BRANDS } from '@tkg/db';
import { _t } from '@tkg/i18n';
import { Button, MetricCard, Metrics, PageHeader, fmt } from '@tkg/ui';
import { parseListFilters, parsePosFilters, type SearchParams } from '../params';
import { listPaused, listPos, listSkus } from '../queries';
import { PosView } from '../ui/pos-view';
import { SkuBrandPills, SkuFilterBar } from '../ui/sku-filters';
import { SkuTable } from '../ui/sku-table';

const crumbs = (label: string) => [{ label: 'SKU (Selling)', href: '/sku' }, { label }];

export async function SkuListPage({ searchParams }: { searchParams: SearchParams }) {
  const f = parseListFilters(searchParams);
  const data = await listSkus(f);
  const cur = { ...f, page: data.page };
  const query = { br: f.br, q: f.q, l1: f.l1, l2: f.l2, status: f.status, gap: f.gap };
  return (
    <>
      <PageHeader
        title={_t('รายการ SKU')}
        description={_t('ค้นหาจากชื่อไทย/อังกฤษ รหัส TKG หรือรหัส POS คลิกแถวเพื่อดูรายละเอียดและการจับคู่ POS')}
        crumbs={crumbs(_t('รายการ SKU'))}
        actions={
          <>
            <Button href="/sku/io" icon="dl">
              {_t('ส่งออก')}
            </Button>
            <Button href="/sku/approve" icon="plus" primary>
              {_t('ขอเพิ่ม SKU')}
            </Button>
          </>
        }
      />
      <SkuBrandPills f={cur} brands={data.brandCounts} allCount={data.allCount} />
      <section className="card">
        <SkuFilterBar f={cur} l1Options={data.l1Options} l2Options={data.l2Options} />
        <SkuTable
          rows={data.rows}
          total={data.total}
          page={data.page}
          path="/sku/list"
          query={Object.fromEntries(Object.entries(query).filter(([, v]) => v))}
        />
      </section>
    </>
  );
}

export async function SkuPausedPage({ searchParams }: { searchParams: SearchParams }) {
  const { page } = parsePosFilters(searchParams);
  const data = await listPaused(page);
  return (
    <>
      <PageHeader
        title={_t('งดขายชั่วคราว')}
        description={_t('เมนูที่ยังอยู่ใน POS แต่ปิดขายอยู่ ณ วันที่ดึงข้อมูล')}
        crumbs={crumbs(_t('งดขายชั่วคราว'))}
      />
      <div className="pills">
        {data.byBrand.map((b) => (
          <span key={b.code} className="tag" style={{ height: 28, padding: '0 12px', fontSize: 13 }}>
            <b style={{ fontWeight: 600, marginRight: 6 }}>{b.code}</b>
            {fmt(b.count)}
          </span>
        ))}
      </div>
      <section className="card">
        <SkuTable rows={data.rows} total={data.total} page={data.page} path="/sku/paused" />
      </section>
    </>
  );
}

export async function SkuPosPage({ searchParams }: { searchParams: SearchParams }) {
  const f = parsePosFilters(searchParams);
  const data = await listPos(f);
  return (
    <>
      <PageHeader
        title={_t('รหัส POS')}
        description={_t('รหัส POS จับคู่กับรหัส TKG ของแต่ละ SKU ไม่ได้ใช้แทนรหัส TKG ถ้าเปลี่ยนระบบ POS รหัส TKG ยังคงเดิม')}
        crumbs={crumbs(_t('รหัส POS'))}
      />
      <Metrics>
        <MetricCard label={_t('จับคู่ POS แล้ว')} value={fmt(data.withInternalId)} sub={_t('มี POS Internal ID')} />
        <MetricCard
          label={_t('มี POS SKU Code')}
          value={fmt(data.withSkuCode)}
          sub={_t('อีก {n} รายการมีแค่ Internal ID', { n: fmt(data.all - data.withSkuCode) })}
        />
        <MetricCard
          label={_t('แหล่งข้อมูล')}
          value={<span style={{ fontSize: 20 }}>FoodStory</span>}
          sub="manage.foodstory.co"
        />
      </Metrics>
      <PosView
        f={{ ...f, page: data.page }}
        rows={data.rows}
        total={data.total}
        page={data.page}
        brands={BRANDS.map((b) => ({ code: b.code, name: b.nameTh }))}
      />
    </>
  );
}
