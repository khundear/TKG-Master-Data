// ภาพรวม (prototype skuOverview()).
import { _t } from '@tkg/i18n';
import { Bar, Button, Card, MetricCard, Metrics, Note, PageHeader, UiLink, fmt } from '@tkg/ui';
import { NONE, SALES_STATUS, listHref } from '../params';
import { getOverview } from '../queries';
import { Warn } from '../ui/bits';
import { RowLinks } from '../ui/row-links';

const h2 = { margin: 0, fontSize: 16, fontWeight: 600 } as const;

export async function SkuOverviewPage() {
  const o = await getOverview();
  const pct = o.total ? Math.round((o.ready / o.total) * 1000) / 10 : 0;
  const tmax = o.byType[0]?.count ?? 1;
  return (
    <>
      <PageHeader
        title={_t('ภาพรวม')}
        description={_t('ทะเบียนเมนูขายของ 4 แบรนด์ ชื่อและหมวดกลางเก็บที่นี่ รหัส POS เป็นการจับคู่กับรหัส TKG ไม่ได้ใช้แทนกัน')}
        actions={
          <>
            <Button href="/sku/io" icon="dl">
              {_t('นำเข้า / ส่งออก')}
            </Button>
            <Button href="/sku/approve" icon="plus" primary>
              {_t('ขอเพิ่ม SKU')}
            </Button>
          </>
        }
      />
      <Note tone="info">
        {_t('ข้อมูล SKU ยังไม่ final ตัวเลขด้านล่างคำนวณจากไฟล์ล่าสุด (POS snapshot {from} ถึง {to}) และจะเปลี่ยนเมื่อปรับฐานข้อมูล', {
          from: o.snapshotFrom ?? '—',
          to: o.snapshotTo ?? '—',
        })}
      </Note>
      <Metrics>
        <MetricCard label={_t('SKU ทั้งหมด')} value={fmt(o.total)} sub="TK · HK · NT · OK" href={listHref()} />
        <MetricCard
          label={_t('พร้อมขาย')}
          value={fmt(o.ready)}
          sub={_t('{pct}% ของทั้งหมด', { pct })}
          href={listHref({ status: SALES_STATUS.ready })}
        />
        <MetricCard label={_t('งดขายชั่วคราว')} value={fmt(o.paused)} sub={_t('ยังอยู่ใน POS แต่ปิดขาย')} href="/sku/paused" />
        <MetricCard
          label={_t('ยังไม่มีรหัสหมวดกลาง')}
          value={fmt(o.noCategoryCode)}
          sub={_t('SKU Category Code ยังว่าง')}
          href="/sku/gaps"
          warn
        />
      </Metrics>
      <div className="cols">
        <div className="col-main">
          <Card title={_t('SKU ตามแบรนด์')} action={<UiLink href="/sku/stores">{_t('ดูรายสาขา')}</UiLink>}>
            <RowLinks>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{_t('แบรนด์')}</th>
                      <th>{_t('สาขา (POS)')}</th>
                      <th className="r">{_t('ทั้งหมด')}</th>
                      <th className="r">{_t('พร้อมขาย')}</th>
                      <th className="r">{_t('งดขาย')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {o.byBrand.map((b) => (
                      <tr key={b.code} data-href={listHref({ br: b.code })} tabIndex={0}>
                        <td>
                          <span className="bc">{b.code}</span>
                          {b.name}
                        </td>
                        <td>{b.stores.join(', ')}</td>
                        <td className="r num">{fmt(b.total)}</td>
                        <td className="r num">{fmt(b.ready)}</td>
                        <td className="r num" style={b.paused ? { color: 'var(--warn)' } : undefined}>
                          {fmt(b.paused)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </RowLinks>
          </Card>
          <Card title={_t('SKU ตามประเภท')} action={<UiLink href="/sku/categories">{_t('ดูหมวดกลาง')}</UiLink>}>
            {o.byType.map((t) => (
              <UiLink key={t.l1 ?? NONE} className="brow" href={listHref({ l1: t.l1 ?? NONE })}>
                <span>{t.l1 ?? <Warn>{_t('ยังไม่ระบุประเภท')}</Warn>}</span>
                <span className="n">{fmt(t.count)}</span>
                <Bar pct={Math.max(2, Math.round((t.count / tmax) * 100))} warn={!t.l1} />
              </UiLink>
            ))}
            <div style={{ height: 8 }} />
          </Card>
        </div>
        <div className="col-side">
          <section className="card card-b">
            <h2 style={{ ...h2, marginBottom: 6 }}>{_t('โดเมนและผู้ใช้ข้อมูล')}</h2>
            <div className="dm">
              <b>{_t('SKU ขาย')}</b>
              <span className="r">{_t('{n} รายการ', { n: fmt(o.total) })}</span>
              <span className="x">{_t('อ่านโดย Recipes, Food Cost และรายงานยอดขาย')}</span>
            </div>
            <div className="dm">
              <b>{_t('หมวด SKU กลาง')}</b>
              <span className="r">
                {fmt(o.categories.l2)} · {fmt(o.categories.l3)}
              </span>
              <span className="x">{_t('หมวด · หมวดย่อย ใช้ร่วมทุกแบรนด์')}</span>
            </div>
            <div className="dm">
              <b>{_t('หมวดเมนูแบรนด์')}</b>
              <span className="r">{fmt(o.brandMenuCategories)}</span>
              <span className="x">{_t('หมวดตามเมนูของแต่ละร้าน')}</span>
            </div>
            <div className="dm">
              <b>{_t('สาขาและแบรนด์')}</b>
              <span className="r">{_t('ใช้ร่วม')}</span>
              <span className="x">{_t('ต้นทางคือ Company Core · สาขา')}</span>
            </div>
          </section>
          <section className="card card-b">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h2 style={h2}>{_t('เปลี่ยนแปลงล่าสุด')}</h2>
              <UiLink className="lnk" href="/sku/log">
                {_t('ดูทั้งหมด')}
              </UiLink>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
              {_t('ยังไม่มีการเปลี่ยนแปลง ทุกการแก้ไขข้อมูลหลักจะปรากฏที่นี่')}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
