// Pages not built yet (prototype placeholder() / PH): approvals, import/export, change history, settings.
// Wording is the prototype's. Nothing here reads or writes data.
import { _t } from '@tkg/i18n';
import { Card, EmptyState, PageHeader, type IconName } from '@tkg/ui';

export type SkuPlaceholderKind = 'approve' | 'io' | 'log' | 'config';

function content(kind: SkuPlaceholderKind): { title: string; icon: IconName; body: string } {
  switch (kind) {
    case 'approve':
      return {
        title: _t('คำขอเพิ่ม / ปรับ / เลิกขาย'),
        icon: 'layers',
        body: _t('คำขอเพิ่มเมนูใหม่ ปรับชื่อ / หมวด หรือเลิกขาย จะเข้ามาที่นี่ก่อนส่งไป POS'),
      };
    case 'io':
      return {
        title: _t('นำเข้า / ส่งออกข้อมูล'),
        icon: 'dl',
        body: _t('ดึงเมนูจาก POS รอบใหม่ เทียบกับทะเบียน และส่งออกเป็น Excel / CSV'),
      };
    case 'log':
      return {
        title: _t('ประวัติการเปลี่ยนแปลง'),
        icon: 'clock',
        body: _t('ทุกการแก้ไขจะบันทึกว่าใครแก้ เมื่อไร และค่าก่อน–หลัง'),
      };
    case 'config':
      return { title: _t('ตั้งค่า'), icon: 'gear', body: _t('สิทธิ์ผู้แก้ไข รูปแบบรหัส TKG และการเชื่อม POS') };
  }
}

export function SkuPlaceholderPage({ kind }: { kind: SkuPlaceholderKind }) {
  const c = content(kind);
  return (
    <>
      <PageHeader title={c.title} crumbs={[{ label: 'SKU (Selling)', href: '/sku' }, { label: c.title }]} />
      <Card>
        <EmptyState icon={c.icon} title={_t('ยังไม่เปิดใช้ในต้นแบบนี้')}>
          {c.body}
        </EmptyState>
      </Card>
    </>
  );
}
