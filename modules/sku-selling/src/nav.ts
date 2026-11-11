// Left menu of the SKU (Selling) module, as in prototype skuNav().
import { _t } from '@tkg/i18n';
import type { NavSection } from '@tkg/ui';

export const SKU_BASE = '/sku';

export function skuNav(counts: { total: number; noCategoryCode: number; paused: number }): NavSection[] {
  return [
    { items: [{ href: '/sku', label: _t('ภาพรวม'), icon: 'home' }] },
    {
      heading: _t('สินค้าขาย'),
      items: [
        { href: '/sku/list', label: _t('รายการ SKU'), icon: 'utensils', count: counts.total },
        { href: '/sku/stores', label: _t('การเปิดขายรายสาขา'), icon: 'store' },
        { href: '/sku/pos', label: _t('รหัส POS'), icon: 'barcode' },
      ],
    },
    {
      heading: _t('หมวดหมู่'),
      items: [
        { href: '/sku/categories', label: _t('หมวด SKU กลาง'), icon: 'tree' },
        { href: '/sku/brand-categories', label: _t('หมวดเมนูแบรนด์'), icon: 'tag' },
      ],
    },
    {
      heading: _t('ตรวจทานข้อมูล'),
      items: [
        { href: '/sku/gaps', label: _t('ข้อมูลที่ต้องเติม'), icon: 'warn', count: counts.noCategoryCode, warn: true },
        { href: '/sku/paused', label: _t('งดขายชั่วคราว'), icon: 'pause', count: counts.paused },
      ],
    },
    { heading: _t('การกำกับดูแล'), items: [{ href: '/sku/approve', label: _t('คำขอเพิ่ม / ปรับ / เลิกขาย'), icon: 'layers' }] },
    {
      heading: _t('ข้อมูลและรายงาน'),
      items: [
        { href: '/sku/io', label: _t('นำเข้า / ส่งออกข้อมูล'), icon: 'dl' },
        { href: '/sku/log', label: _t('ประวัติการเปลี่ยนแปลง'), icon: 'clock' },
      ],
    },
    { footer: true, items: [{ href: '/sku/config', label: _t('ตั้งค่า'), icon: 'gear' }] },
  ];
}
