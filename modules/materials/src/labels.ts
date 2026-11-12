// Display labels for codes stored as the sheet has them. Every Thai string goes through _t().
import { _t } from '@tkg/i18n';
import type { ChipTone } from '@tkg/ui';

export const BRAND_CODES = ['TK', 'HK', 'NT', 'OK'] as const;
export type BrandCode = (typeof BRAND_CODES)[number];

export const brandName = (code: string): string =>
  ({ TK: _t('ต้นเครื่อง'), HK: _t('หางเครื่อง'), NT: 'NONNA TWIST', OK: _t('อุ่นเครื่อง') })[code] ?? code;

export const brandNames = (): Record<string, string> => Object.fromEntries(BRAND_CODES.map((c) => [c, brandName(c)]));

/** Group RM / SP / SM. */
export const groupName = (g: string): string =>
  ({ RM: _t('วัตถุดิบ'), SP: _t('วัสดุ'), SM: _t('กึ่งสำเร็จรูป') })[g] ?? g;

/** Thai name of a primary category code (prototype P1TH). Unknown codes show as is. */
export const primaryName = (code: string): string =>
  ({
    PROTEIN: _t('โปรตีน'),
    DAIRY: _t('นม'),
    VEGETABLE: _t('ผัก'),
    FRUITS: _t('ผลไม้'),
    DRIED_GOODS: _t('ของแห้ง'),
    SNACKS: _t('ขนม'),
    BAKERY: _t('เบเกอรี่'),
    CONDIMENTS: _t('เครื่องปรุง'),
    PRESERVED: _t('อาหารแปรรูป'),
    BEVERAGE: _t('เครื่องดื่ม'),
    DESSERT: _t('ของหวาน'),
    CONSUMABLE: _t('วัสดุสิ้นเปลือง'),
    KITCHEN_EQUIPMENT: _t('อุปกรณ์ครัว'),
    CLEANING: _t('ทำความสะอาด'),
    CUSTOMER_SUPPLIES: _t('อุปกรณ์ลูกค้า'),
    STAFF: _t('พนักงาน'),
    FOOD_PACKING: _t('บรรจุภัณฑ์'),
    OTHERS: _t('อื่น ๆ'),
    'SEMI-FINISHED GOODS': _t('กึ่งสำเร็จรูป'),
  })[code] ?? code;

/** Values of Material.mappingStatus, in the prototype's order. */
export const MAPPING_STATUSES = ['ตรงกัน', 'ย้ายหมวด', 'ต้องตัดสินใจ', 'คงไว้เป็น SM', 'ยกเลิก'] as const;

/** Chip tone and label for a mapping status. This is the category status, never an approval status. */
export const statusChip = (st: string): [ChipTone, string] =>
  (
    ({
      ตรงกัน: ['ok', _t('หมวดตรงกัน')],
      ย้ายหมวด: ['info', _t('ย้ายหมวด')],
      ต้องตัดสินใจ: ['warn', _t('รอตัดสินใจ')],
      'คงไว้เป็น SM': ['mute', 'SM'],
      ยกเลิก: ['bad', _t('ยกเลิก')],
    }) as Record<string, [ChipTone, string]>
  )[st] ?? ['mute', st];

/** "EA - ชิ้น" → "ชิ้น"; anything else as is. */
export const unitShort = (label: string): string => label.split(' - ')[1] ?? label;
/** "EA - ชิ้น" → "EA". */
export const unitCode = (label: string): string => label.split(' - ')[0] ?? label;
