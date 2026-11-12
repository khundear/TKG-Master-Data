// Pages that are not open yet (prototype placeholder()). They say so plainly and never show made-up requests or history.
import { _t } from '@tkg/i18n';
import { Card, EmptyState, PageHeader, type IconName } from '@tkg/ui';
import { crumbs } from './common';

export type PlaceholderId = 'buy' | 'approve' | 'io' | 'log' | 'config';

const PAGES = (): Record<PlaceholderId, { title: string; icon: IconName; body: string }> => ({
  buy: {
    title: _t('รายการซื้อ (ยี่ห้อ / แพ็ก)'),
    icon: 'cart',
    body: _t('หน้านี้จะผูก Material 1 รายการกับยี่ห้อ ขนาดแพ็ก และผู้ขายหลายราย ไฟล์ปัจจุบันยังไม่มีคอลัมน์ยี่ห้อ / รุ่น / ขนาดที่กรอกไว้ จึงยังไม่มีข้อมูลให้แสดง'),
  },
  approve: {
    title: _t('คำขออนุมัติ'),
    icon: 'layers',
    body: _t('คำขอเพิ่ม แก้ไข หรือเลิกใช้ Material จะเข้ามาที่นี่และส่งต่อผู้อนุมัติตามอำนาจอนุมัติใน Company Core'),
  },
  io: { title: _t('นำเข้า / ส่งออกข้อมูล'), icon: 'dl', body: _t('นำเข้าไฟล์ Excel รอบใหม่ เทียบความต่างก่อนบันทึก และส่งออกเป็น Excel / CSV') },
  log: { title: _t('ประวัติการเปลี่ยนแปลง'), icon: 'clock', body: _t('ทุกการแก้ไขจะบันทึกว่าใครแก้ เมื่อไร และค่าก่อน–หลัง') },
  config: { title: _t('ตั้งค่า'), icon: 'gear', body: _t('สิทธิ์ผู้แก้ไข รูปแบบรหัส Material และการแจ้งเตือน') },
});

export function MaterialPlaceholderPage({ id }: { id: PlaceholderId }) {
  const p = PAGES()[id];
  return (
    <>
      <PageHeader title={p.title} crumbs={crumbs(p.title)} />
      <Card>
        <EmptyState icon={p.icon} title={_t('ยังไม่เปิดใช้ · อยู่ในระยะถัดไป')}>
          {p.body}
        </EmptyState>
      </Card>
    </>
  );
}
