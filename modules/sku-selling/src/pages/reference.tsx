// การเปิดขายรายสาขา, หมวด SKU กลาง, หมวดเมนูแบรนด์, ข้อมูลที่ต้องเติม (prototype skuStores / skuCats / skuBrandCats / skuGaps).
import { _t } from '@tkg/i18n';
import { Bar, FilterPills, Note, PageHeader, UiLink, fmt, money } from '@tkg/ui';
import { BRAND_CODES, listHref, type SearchParams } from '../params';
import { getBrandMenuCategories, getCategoryTree, getGaps, getStores } from '../queries';
import { Dash } from '../ui/bits';
import { RowLinks } from '../ui/row-links';

const crumbs = (label: string) => [{ label: 'SKU (Selling)', href: '/sku' }, { label }];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export async function SkuStoresPage() {
  const stores = await getStores();
  return (
    <>
      <PageHeader
        title={_t('การเปิดขายรายสาขา')}
        description={_t('1 แถว = 1 รายการ POS × 1 ร้าน ตอนนี้ไฟล์มีแบรนด์ละ 1 สาขา เมื่อเพิ่มสาขาจะเห็นการเปิด–ปิดขายแยกรายร้านที่นี่')}
        crumbs={crumbs(_t('การเปิดขายรายสาขา'))}
      />
      <Note tone="info">{_t('ชื่อสาขาควรอ้างอิงจาก Company Core · สาขา ตอนนี้ใช้ชื่อตามที่ POS ส่งมา')}</Note>
      <section className="card">
        <RowLinks>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>{_t('สาขา (ตาม POS)')}</th>
                  <th>{_t('แบรนด์')}</th>
                  <th className="r">{_t('รายการใน POS')}</th>
                  <th className="r">{_t('พร้อมขาย')}</th>
                  <th className="r">{_t('งดขาย')}</th>
                  <th className="r">{_t('ราคาเฉลี่ย')}</th>
                  <th>{_t('Snapshot')}</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={`${s.brand}|${s.name}`} data-href={listHref({ br: s.brand })} tabIndex={0}>
                    <td>
                      <b style={{ fontWeight: 600 }}>{s.name}</b>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="bc">{s.brand}</span>
                      {s.brandName}
                    </td>
                    <td className="r num">{fmt(s.total)}</td>
                    <td className="r num">{fmt(s.ready)}</td>
                    <td className="r num" style={s.paused ? { color: 'var(--warn)' } : undefined}>
                      {fmt(s.paused)}
                    </td>
                    <td className="r num">{s.avgPrice == null ? <Dash /> : money(Math.round(s.avgPrice))}</td>
                    <td className="mono" style={{ whiteSpace: 'nowrap' }}>
                      {s.snapshot ?? <Dash />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RowLinks>
      </section>
    </>
  );
}

export async function SkuCategoriesPage() {
  const tree = await getCategoryTree();
  const width = (n: number) => Math.min(100, Math.round(n / 4));
  return (
    <>
      <PageHeader
        title={_t('หมวด SKU กลาง')}
        description={_t('หมวดกลางที่ใช้ร่วมทุกแบรนด์ (ประเภท · หมวด · หมวดย่อย) ใช้เทียบยอดขายข้ามแบรนด์')}
        crumbs={crumbs(_t('หมวด SKU กลาง'))}
      />
      <Note tone="info">{_t('ยังไม่มี SKU ที่ผูกรหัสหมวดกลาง (SKU Category Code) จำนวนด้านล่างนับจากชื่อหมวดที่กรอกไว้ในชีต')}</Note>
      <section className="card">
        <div className="tree-row l0" style={{ color: 'var(--ink-3)', fontSize: 12, fontWeight: 500 }}>
          <span>{_t('หมวด')}</span>
          <span style={{ textAlign: 'right' }}>{_t('SKU')}</span>
          <span />
        </div>
        {tree.map((c) =>
          c.level === 1 ? (
            <div key={c.code} className="tree-row l0">
              <span className="nm">
                {c.nameTh} · {c.nameEn} <span className="cd">{c.code}</span>
              </span>
              <span className="num" style={{ textAlign: 'right' }}>
                {fmt(c.count)}
              </span>
              <span />
            </div>
          ) : (
            <UiLink key={c.code} className={`tree-row ${c.level === 2 ? 'l1' : 'l2'}`} href={listHref({ l2: c.l2Th ?? '' })}>
              <span className="nm">
                {c.nameTh ?? c.nameEn} <span className="cd">{c.code}</span>
              </span>
              <span className="num" style={{ textAlign: 'right', color: c.count ? undefined : 'var(--ink-4)' }}>
                {fmt(c.count)}
              </span>
              <Bar pct={width(c.count)} />
            </UiLink>
          ),
        )}
      </section>
    </>
  );
}

export async function SkuBrandCategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const b = one(searchParams.brand);
  const brand = (BRAND_CODES as readonly string[]).includes(b) ? b : 'TK';
  const data = await getBrandMenuCategories(brand);
  return (
    <>
      <PageHeader
        title={_t('หมวดเมนูแบรนด์')}
        description={_t('หมวดตามเมนูของแต่ละร้าน ใช้แสดงหน้าร้านและใน POS แยกจากหมวดกลาง')}
        crumbs={crumbs(_t('หมวดเมนูแบรนด์'))}
      />
      <FilterPills
        label={_t('เลือกแบรนด์')}
        value={brand}
        hrefFor={(v) => `/sku/brand-categories?brand=${v}`}
        options={data.brands.map((x) => ({ value: x.code, label: `${x.code} · ${x.name}`, count: x.count }))}
      />
      <section className="card">
        <RowLinks>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>{_t('ประเภท')}</th>
                  <th>{_t('หมวดเมนู')}</th>
                  <th>{_t('หมวดย่อย')}</th>
                  <th>{_t('Prefix')}</th>
                  <th className="r">{_t('SKU')}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.id} data-href={listHref({ br: brand })} tabIndex={0}>
                    <td>{r.type ?? <Dash />}</td>
                    <td>{r.category ?? <Dash />}</td>
                    <td>{r.subcategory ?? <Dash />}</td>
                    <td className="mono">{r.prefix ?? <Dash />}</td>
                    <td className="r num">{r.count ? fmt(r.count) : <span style={{ color: 'var(--ink-4)' }}>0</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RowLinks>
      </section>
    </>
  );
}

export async function SkuGapsPage() {
  const g = await getGaps();
  const items = [
    {
      key: 'code',
      title: _t('ยังไม่มีรหัสหมวดกลาง (SKU Category Code)'),
      detail: _t('ต้องเลือก L3 หรือ L2 ให้แต่ละ SKU ก่อนใช้รายงานข้ามแบรนด์'),
      n: g.code,
      href: '/sku/categories',
    },
    {
      key: 'note',
      title: _t('มีหมายเหตุการจัดหมวดรอยืนยัน'),
      detail: _t('เช่น ยืนยันหมวดย่อย หรือ POS เดิมไม่ระบุกลุ่ม'),
      n: g.note,
      href: listHref({ gap: 'note' }),
    },
    {
      key: 'pos',
      title: _t('มีแค่ POS Internal ID ไม่มี POS SKU Code'),
      detail: _t('ไม่ผิด แต่ควรตั้ง SKU Code ใน POS ให้ครบเพื่อจับคู่ได้แน่นอน'),
      n: g.pos,
      href: listHref({ gap: 'pos' }),
    },
    {
      key: 'price',
      title: _t('ไม่มีราคาใน POS'),
      detail: _t('ราคา "กำหนดเอง" ไม่ใช่ 0'),
      n: g.price,
      href: listHref({ gap: 'price' }),
    },
    {
      key: 'l1',
      title: _t('ยังไม่ระบุประเภท (อาหาร / เครื่องดื่ม / ของหวาน)'),
      detail: '',
      n: g.l1,
      href: listHref({ gap: 'l1' }),
    },
  ];
  return (
    <>
      <PageHeader
        title={_t('ข้อมูลที่ต้องเติม')}
        description={_t('สิ่งที่ยังขาดก่อนล็อกข้อมูล SKU คลิกแต่ละข้อเพื่อดูรายการ')}
        crumbs={crumbs(_t('ข้อมูลที่ต้องเติม'))}
      />
      <Note tone="info">{_t('ข้อมูล SKU ยังไม่ final รายการนี้จะสั้นลงหลังปรับโครงสร้างฐานข้อมูล')}</Note>
      <section className="card">
        {items.map((it) => (
          <UiLink key={it.key} className="brow gap-row" href={it.href}>
            <span>
              <b style={{ fontWeight: 600 }}>{it.title}</b>
              {it.detail ? <span className="t2">{it.detail}</span> : null}
            </span>
            <span className="n" style={it.n ? { color: 'var(--warn)' } : undefined}>
              {fmt(it.n)}
            </span>
            <Bar pct={g.total ? Math.max(it.n ? 2 : 0, Math.round((it.n / g.total) * 100)) : 0} warn />
          </UiLink>
        ))}
      </section>
    </>
  );
}
