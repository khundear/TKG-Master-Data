// Reference data that does not come from the sheets.
export const BRANDS = [
  { code: 'TK', nameTh: 'ต้นเครื่อง', nameEn: null },
  { code: 'HK', nameTh: 'หางเครื่อง', nameEn: null },
  { code: 'NT', nameTh: 'NONNA TWIST', nameEn: 'NONNA TWIST' },
  { code: 'OK', nameTh: 'อุ่นเครื่อง', nameEn: null },
] as const;

/** Values of Material.mappingStatus as written in the sheet. */
export const MATERIAL_MAPPING_STATUS = {
  matched: 'ตรงกัน',
  move: 'ย้ายหมวด',
  decide: 'ต้องตัดสินใจ',
  keepSm: 'คงไว้เป็น SM',
  cancelled: 'ยกเลิก',
} as const;

/** Values of PosMapping.salesStatus as written in the POS snapshot. */
export const POS_SALES_STATUS = {
  ready: 'พร้อมขาย',
  paused: 'งดขายชั่วคราว',
} as const;
