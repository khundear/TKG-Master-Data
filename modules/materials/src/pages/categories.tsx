// /materials/categories — Material Master Bible tree, 3 levels (prototype matCats()). Click a category to list it.
import { _t } from '@tkg/i18n';
import { Bar, Card, PageHeader, Tag, UiLink, fmt } from '@tkg/ui';
import { inBible, listHref } from '../filters';
import { groupName } from '../labels';
import { activeSummary, bibleTree } from '../queries';
import { crumbs } from './common';

export async function MaterialCategoriesPage() {
  const [tree, ma] = await Promise.all([bibleTree(), activeSummary()]);
  const levels = [1, 2, 3].map((l) => tree.filter((b) => b.level === l).length);
  const rows: React.ReactNode[] = [];
  let group = '';
  for (const b of tree) {
    // Group heading (RM / SP) before its first category. Not a Bible row; it groups the tree as the prototype does.
    if (b.group !== group) {
      group = b.group;
      rows.push(
        <div key={`g-${group}`} className="tree-row l0">
          <span className="nm">{`${group} · ${groupName(group)}`}</span>
          <span className="num" style={{ textAlign: 'right' }}>
            {fmt(ma.filter((m) => m.group === group).length)}
          </span>
          <span />
        </div>,
      );
    }
    const code = b.level === 1 ? b.primaryCode : b.level === 2 ? b.secondaryCode : b.tertiaryCode;
    const n = ma.filter((m) => inBible(m.bibleCode, b.code)).length;
    rows.push(
      <UiLink key={b.code} className={`tree-row l${b.level}`} href={listHref({ bible: b.code })}>
        <span className="nm">
          {b.nameTh ?? b.code} <span className="cd">{code ?? b.code}</span>
        </span>
        <span className="num" style={{ textAlign: 'right' }}>
          {fmt(n)}
        </span>
        <Bar pct={Math.min(100, Math.round(n / 2.3))} />
      </UiLink>,
    );
  }
  return (
    <>
      <PageHeader
        title={_t('หมวด Material')}
        description={_t('Material Category Master Bible 3 ระดับ (หลัก · ย่อย · ละเอียด) คลิกหมวดเพื่อดูรายการในหมวดนั้น')}
        crumbs={crumbs(_t('หมวด Material'))}
        actions={<Tag>{_t('{levels} หมวด', { levels: levels.join(' · ') })}</Tag>}
      />
      <Card>
        <div className="tree-row l0" style={{ background: '#FCFCFC', color: 'var(--ink-3)', fontSize: 12, fontWeight: 500 }}>
          <span>{_t('หมวด')}</span>
          <span style={{ textAlign: 'right' }}>Material</span>
          <span />
        </div>
        {rows}
      </Card>
    </>
  );
}
