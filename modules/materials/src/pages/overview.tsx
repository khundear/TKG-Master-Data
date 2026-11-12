// /materials — overview (prototype matOverview()). Counts are draft data from the sheets, never "approved".
import { _t } from '@tkg/i18n';
import { Bar, Button, Card, MetricCard, Metrics, PageHeader, UiLink, fmt } from '@tkg/ui';
import { listHref } from '../filters';
import { BRAND_CODES, primaryName } from '../labels';
import { overviewData } from '../queries';

const H2 = ({ children }: { children: string }) => <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{children}</h2>;

export async function MaterialsOverviewPage() {
  const { summary: ma, all, decide, check, bibleLevels } = await overviewData();
  const cnt = (g: string) => ma.filter((m) => m.group === g).length;
  const byPrimary = (g: 'RM' | 'SP') => {
    const c = new Map<string, number>();
    for (const m of ma) if (m.group === g && m.primary) c.set(m.primary, (c.get(m.primary) ?? 0) + 1);
    const arr = [...c].sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...arr.map((a) => a[1]));
    return arr.map(([p1, n]) => (
      <UiLink key={p1} className="brow" href={listHref({ grp: g, p1 })}>
        <span>
          {primaryName(p1)} <span className="en">{p1}</span>
        </span>
        <span className="n">{fmt(n)}</span>
        <Bar pct={Math.max(2, Math.round((n / max) * 100))} />
      </UiLink>
    ));
  };
  const multi = ma.filter((m) => m.brands.length >= 2).length;
  const none = ma.filter((m) => !m.brands.length).length;
  const brands = BRAND_CODES.map((c) => [c, ma.filter((m) => m.brands.includes(c)).length] as const);
  const bmax = Math.max(1, ...brands.map((b) => b[1]));

  return (
    <>
      <PageHeader
        title={_t('ภาพรวม')}
        description={_t('ทะเบียนวัตถุดิบและวัสดุกลางของทั้งเครือ แก้ที่นี่ที่เดียว ทุกแบรนด์และทุกแอปใช้ข้อมูลเดียวกัน')}
        actions={
          <>
            <Button href="/materials/io" icon="dl">
              {_t('นำเข้า / ส่งออก')}
            </Button>
            <Button href="/materials/approve" icon="plus" primary>
              {_t('ขอเพิ่ม Material')}
            </Button>
          </>
        }
      />
      <Metrics>
        <MetricCard
          label={_t('Material ทั้งหมด')}
          value={fmt(ma.length)}
          sub={_t('RM {rm} · SP {sp} · SM {sm} · ไม่นับยกเลิก {n}', { rm: fmt(cnt('RM')), sp: fmt(cnt('SP')), sm: fmt(cnt('SM')), n: all - ma.length })}
          href={listHref()}
        />
        <MetricCard label={_t('ใช้ร่วมหลายแบรนด์')} value={fmt(multi)} sub={_t('ระบุใช้ตั้งแต่ 2 แบรนด์ขึ้นไป')} href={listHref({ br: 'multi' })} />
        <MetricCard label={_t('ยังไม่ระบุแบรนด์')} value={fmt(none)} sub={_t('ทั้ง 4 แบรนด์ยังไม่ระบุว่าใช้ (ไม่ใช่ห้ามใช้)')} href={listHref({ br: 'none' })} />
        <MetricCard
          label={_t('ต้องตัดสินใจ / ไม่ครบ')}
          value={fmt(decide + check)}
          sub={_t('รอจัดหมวด {d} · ต้องตรวจสอบ {c}', { d: decide, c: check })}
          href="/materials/review"
          warn
        />
      </Metrics>
      <div className="cols">
        <div className="col-main">
          <Card title={_t('Material ตามหมวดหลัก')} action={<UiLink href="/materials/categories">{_t('ดูหมวดทั้งหมด')}</UiLink>}>
            <div className="subh">{_t('วัตถุดิบ (RM) · {n}', { n: fmt(cnt('RM')) })}</div>
            {byPrimary('RM')}
            <div className="subh" style={{ borderTop: '1px solid var(--line)', marginTop: 6, paddingTop: 14 }}>
              {_t('วัสดุ (SP) · {n}', { n: fmt(cnt('SP')) })}
            </div>
            {byPrimary('SP')}
            <div style={{ height: 8 }} />
          </Card>
        </div>
        <div className="col-side">
          <section className="card card-b">
            <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>{_t('การใช้ตามแบรนด์')}</h2>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--ink-3)' }}>
              {_t('Material ที่ระบุว่าใช้ ยอดทับซ้อนกัน ห้ามรวมเป็นยอดกลาง')}
            </p>
            {brands.map(([c, n]) => (
              <UiLink key={c} className="brow brow-brand" href={listHref({ br: c })}>
                <b style={{ fontSize: 13 }}>{c}</b>
                <Bar pct={Math.round((n / bmax) * 100)} />
                <span className="n">{fmt(n)}</span>
              </UiLink>
            ))}
          </section>
          <section className="card card-b">
            <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>{_t('โดเมนและผู้ใช้ข้อมูล')}</h2>
            <div className="dm">
              <b>Material</b>
              <span className="r">{_t('{n} รายการ', { n: fmt(ma.length) })}</span>
              <span className="x">{_t('อ่านโดย Recipes, Food Cost, Purchasing')}</span>
            </div>
            <div className="dm">
              <b>{_t('หมวด Material')}</b>
              <span className="r">{bibleLevels.join(' · ')}</span>
              <span className="x">{_t('หลัก · ย่อย · ละเอียด')}</span>
            </div>
            <div className="dm">
              <b>{_t('หน่วยนับ')}</b>
              <span className="r">{_t('ใช้ร่วม')}</span>
              <span className="x">{_t('ต้นทางคือ Company Core · หน่วยนับ')}</span>
            </div>
            <div className="dm">
              <b>{_t('แบรนด์และสาขา')}</b>
              <span className="r">{_t('ใช้ร่วม')}</span>
              <span className="x">{_t('ต้นทางคือ Company Core · สาขา')}</span>
            </div>
          </section>
          <section className="card card-b">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <H2>{_t('เปลี่ยนแปลงล่าสุด')}</H2>
              <UiLink className="lnk" href="/materials/log">
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
