// Left menu of the Materials module (prototype matNav()).
import { _t } from '@tkg/i18n';
import type { NavSection } from '@tkg/ui';

export const BASE = '/materials';

export function materialsNav(c: { active: number; sm: number; decide: number; changed: number }): NavSection[] {
  return [
    { items: [{ href: BASE, label: _t('ภาพรวม'), icon: 'home' }] },
    {
      heading: _t('วัตถุดิบและวัสดุ'),
      items: [
        { href: `${BASE}/list`, label: _t('รายการ Material'), icon: 'box', count: c.active },
        { href: `${BASE}/buy`, label: _t('รายการซื้อ (ยี่ห้อ / แพ็ก)'), icon: 'cart' },
        { href: `${BASE}/sm`, label: _t('ของผลิตเอง (ครัวกลาง)'), icon: 'chef', count: c.sm },
        { href: `${BASE}/brands`, label: _t('การใช้ตามแบรนด์'), icon: 'chart' },
      ],
    },
    {
      heading: _t('หมวดและหน่วย'),
      items: [
        { href: `${BASE}/categories`, label: _t('หมวด Material'), icon: 'tree' },
        { href: `${BASE}/units`, label: _t('หน่วยและอัตราแปลง'), icon: 'scale' },
      ],
    },
    {
      heading: _t('ตรวจทานข้อมูล'),
      items: [
        { href: `${BASE}/review`, label: _t('รอจัดหมวด'), icon: 'warn', count: c.decide, warn: true },
        { href: `${BASE}/ids`, label: _t('รหัสเก่า–ใหม่'), icon: 'swap', count: c.changed },
      ],
    },
    { heading: _t('การกำกับดูแล'), items: [{ href: `${BASE}/approve`, label: _t('คำขออนุมัติ'), icon: 'layers' }] },
    {
      heading: _t('ข้อมูลและรายงาน'),
      items: [
        { href: `${BASE}/io`, label: _t('นำเข้า / ส่งออกข้อมูล'), icon: 'dl' },
        { href: `${BASE}/log`, label: _t('ประวัติการเปลี่ยนแปลง'), icon: 'clock' },
      ],
    },
    { footer: true, items: [{ href: `${BASE}/config`, label: _t('ตั้งค่า'), icon: 'gear' }] },
  ];
}
