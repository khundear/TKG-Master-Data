// /materials/brands — usage by brand (prototype matBrands()). No usage row = "not specified", never "not allowed".
import { _t } from '@tkg/i18n';
import { Bar, Card, PageHeader, UiLink, fmt } from '@tkg/ui';
import { LinkRow } from '../components/link-row';
import { listHref } from '../filters';
import { BRAND_CODES, brandName } from '../labels';
import { activeSummary } from '../queries';
import { crumbs } from './common';

export async function MaterialBrandsPage() {
  const ma = await activeSummary();
  const combos = new Map<string, number>();
  for (const m of ma) {
    const k = m.brands.length ? BRAND_CODES.filter((c) => m.brands.includes(c)).join(' + ') : '';
    combos.set(k, (combos.get(k) ?? 0) + 1);
  }
  const arr = [...combos].sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...arr.map((a) => a[1]));
  const perBrand = BRAND_CODES.map((c) => {
    const mine = ma.filter((m) => m.brands.includes(c));
    return { c, all: mine.length, only: mine.filter((m) => m.brands.length === 1).length, shared: mine.filter((m) => m.brands.length > 1).length };
  });
  return (
    <>
      <PageHeader
        title={_t('การใช้ตามแบรนด์')}
        description={_t('แต่ละ Material ระบุได้หลายแบรนด์ ค่าว่างในไฟล์หมายถึง "ยังไม่ระบุ" ไม่ใช่ "ห้ามใช้"')}
        crumbs={crumbs(_t('การใช้ตามแบรนด์'))}
      />
      <Card>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{_t('แบรนด์')}</th>
                <th className="r">{_t('ระบุว่าใช้')}</th>
                <th className="r">{_t('ใช้แบรนด์เดียว')}</th>
                <th className="r">{_t('ใช้ร่วมแบรนด์อื่น')}</th>
              </tr>
            </thead>
            <tbody>
              {perBrand.map((b) => (
                <LinkRow key={b.c} href={listHref({ br: b.c })}>
                  <td>
                    <UiLink className="mat-cell" href={listHref({ br: b.c })}>
                      <span className="bc">{b.c}</span>
                      {brandName(b.c)}
                    </UiLink>
                  </td>
                  <td className="r num">{fmt(b.all)}</td>
                  <td className="r num">{fmt(b.only)}</td>
                  <td className="r num">{fmt(b.shared)}</td>
                </LinkRow>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title={_t('ชุดแบรนด์ที่ใช้ร่วมกัน')} action={<span className="t2" style={{ margin: 0 }}>{_t('{n} ชุด', { n: arr.length })}</span>}>
        {arr.map(([k, n]) => {
          const codes = k ? k.split(' + ') : [];
          const href = !codes.length ? listHref({ br: 'none' }) : codes.length === 1 ? listHref({ br: codes[0] as 'TK' }) : listHref({ br: 'multi' });
          return (
            <UiLink key={k || 'none'} className="brow" href={href}>
              <span>
                {codes.length ? (
                  codes.map((c) => (
                    <span key={c} className="bc">
                      {c}
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--warn)' }}>{_t('ยังไม่ระบุแบรนด์')}</span>
                )}
              </span>
              <span className="n">{fmt(n)}</span>
              <Bar pct={Math.max(2, Math.round((n / max) * 100))} warn={!codes.length} />
            </UiLink>
          );
        })}
      </Card>
    </>
  );
}
