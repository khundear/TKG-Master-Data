// /materials/units — units in use (prototype matUnits()). The sheet has no conversions yet.
import { _t } from '@tkg/i18n';
import { Card, Note, PageHeader, StatusChip, UiLink, fmt } from '@tkg/ui';
import { LinkRow } from '../components/link-row';
import { listHref } from '../filters';
import { unitCode, unitShort } from '../labels';
import { activeSummary } from '../queries';
import { crumbs } from './common';

export async function MaterialUnitsPage() {
  const ma = await activeSummary();
  const units = new Map<string, { key: string; code: string; name: string; n: number }>();
  let none = 0;
  for (const m of ma) {
    if (!m.unitLabel) {
      none++;
      continue;
    }
    // Filter key: the unit code when the label maps to a unit, else the raw label.
    const key = m.unitCode ?? m.unitLabel;
    const u = units.get(key) ?? { key, code: m.unitCode ?? unitCode(m.unitLabel), name: m.unitName ?? unitShort(m.unitLabel), n: 0 };
    u.n++;
    units.set(key, u);
  }
  const arr = [...units.values()].sort((a, b) => b.n - a.n);
  const noneRow = (
    <LinkRow key="none" href={listHref({ unit: 'none' })}>
      <td className="mono">
        <UiLink className="mat-cell" href={listHref({ unit: 'none' })}>
          —
        </UiLink>
      </td>
      <td style={{ color: 'var(--warn)' }}>{_t('ยังไม่ระบุหน่วย')}</td>
      <td className="r num">{fmt(none)}</td>
      <td>
        <StatusChip tone="warn">{_t('ต้องเติม')}</StatusChip>
      </td>
    </LinkRow>
  );
  const rows = arr.map((u) => (
    <LinkRow key={u.key} href={listHref({ unit: u.key })}>
      <td className="mono">
        <UiLink className="mat-cell" href={listHref({ unit: u.key })}>
          {u.code}
        </UiLink>
      </td>
      <td>{u.name}</td>
      <td className="r num">{fmt(u.n)}</td>
      <td>
        <StatusChip tone="mute">{_t('ยังไม่มีข้อมูล')}</StatusChip>
      </td>
    </LinkRow>
  ));
  // Same order as the prototype: by count, "not specified" included.
  const firstSmaller = arr.findIndex((u) => u.n < none);
  if (none) rows.splice(firstSmaller < 0 ? rows.length : firstSmaller, 0, noneRow);
  return (
    <>
      <PageHeader
        title={_t('หน่วยและอัตราแปลง')}
        description={_t('หน่วยที่ใช้รับ นับ และใช้ผลิตของแต่ละ Material รายการหน่วยกลางมาจาก Company Core · หน่วยนับ')}
        crumbs={crumbs(_t('หน่วยและอัตราแปลง'))}
      />
      <Note>
        {_t('{n} จาก {total} รายการยังไม่ระบุหน่วย และไฟล์ยังไม่มีอัตราแปลง (ซื้อ → รับ → นับ → ใช้) ต้องเติมก่อนนำไปใช้กับ Recipes และ Food Cost', {
          n: fmt(none),
          total: fmt(ma.length),
        })}
      </Note>
      <Card>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{_t('รหัสหน่วย')}</th>
                <th>{_t('ชื่อหน่วย')}</th>
                <th className="r">Material</th>
                <th>{_t('อัตราแปลง')}</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
