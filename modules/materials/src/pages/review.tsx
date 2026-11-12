// /materials/review?tab=decide|move|check — categories still to settle (prototype matReview()).
import { _t } from '@tkg/i18n';
import { Card, PageHeader, UiLink, cx, fmt } from '@tkg/ui';
import { MaterialTable } from '../components/material-table';
import { reviewMaterials, type ReviewTab } from '../queries';
import { crumbs, type SearchParams } from './common';

export async function MaterialReviewPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).tab;
  const tab: ReviewTab = raw === 'move' || raw === 'check' ? raw : 'decide';
  const { rows, counts } = await reviewMaterials(tab);
  const tabs: { key: ReviewTab; label: string; desc: string; warn: boolean }[] = [
    { key: 'decide', label: _t('รอตัดสินใจ'), desc: _t('Excel ไม่มีหมวดรองรับ ต้องเลือกหมวดหรือเปิดหมวดใหม่'), warn: true },
    { key: 'move', label: _t('ย้ายหมวด'), desc: _t('อยู่ผิดหมวดหรือต้องแยกหมวดย่อย ระบบเสนอหมวดใหม่ให้แล้ว'), warn: false },
    { key: 'check', label: _t('ต้องตรวจสอบ'), desc: _t('จับคู่ Bible ไม่ได้ ต้องให้ผู้รู้ยืนยัน'), warn: true },
  ];
  const cur = tabs.find((t) => t.key === tab)!;
  return (
    <>
      <PageHeader
        title={_t('รอจัดหมวด')}
        description={_t('เทียบหมวดปัจจุบันกับหมวดใน Excel (Food Cost Management System) รายการที่นี่ยังใช้งานได้ แต่ต้องยืนยันหมวดก่อนล็อกข้อมูล')}
        crumbs={crumbs(_t('รอจัดหมวด'))}
      />
      <Card>
        <div className="tabs" role="tablist">
          {tabs.map((t) => (
            <UiLink
              key={t.key}
              className={cx('tab', t.key === tab && 'on')}
              href={t.key === 'decide' ? '/materials/review' : `/materials/review?tab=${t.key}`}
              aria-current={t.key === tab ? 'page' : undefined}
            >
              {t.label}
              <span className={cx('cnt', t.warn && 'warn')} style={{ margin: 0 }}>
                {fmt(counts[t.key])}
              </span>
            </UiLink>
          ))}
        </div>
        <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-3)', borderBottom: '1px solid var(--line)' }}>{cur.desc}</div>
        <MaterialTable rows={rows} variant="review" />
      </Card>
    </>
  );
}
