'use client';
// Detail drawer (prototype matDrawer()): IDs, categories (current → proposed, Bible code, note), brands, unit and
// storage, and where each value came from in the sheet.
import { _t } from '@tkg/i18n';
import { BrandCodes, Button, Drawer, DrawerSection, KeyValues, StatusChip, Tag } from '@tkg/ui';
import { brandNames, groupName, statusChip } from '../labels';
import type { MaterialRow } from '../types';

const Mono = ({ children, dark }: { children: string; dark?: boolean }) => (
  <span className="mono" style={dark ? { color: 'var(--ink)' } : undefined}>
    {children}
  </span>
);

export function MaterialDrawer({ material: m, onClose }: { material: MaterialRow | null; onClose: () => void }) {
  if (!m) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;
  const [tone, label] = statusChip(m.mappingStatus);
  const changed = m.code !== m.legacyCode;
  return (
    <Drawer
      open
      onClose={onClose}
      code={m.code}
      title={m.name}
      chips={
        <>
          <StatusChip tone={tone}>{label}</StatusChip>
          {m.crosswalkFlag === 'ต้องตรวจสอบ' ? <StatusChip tone="warn">{_t('ต้องตรวจสอบ')}</StatusChip> : null}
          {m.group ? <Tag>{`${m.group} · ${groupName(m.group)}`}</Tag> : null}
          <Tag>{_t('ร่าง')}</Tag>
        </>
      }
      footer={
        <>
          <Button href="/materials/log" icon="clock">
            {_t('ประวัติ')}
          </Button>
          <Button href="/materials/approve" primary>
            {_t('ขอแก้ไขข้อมูล')}
          </Button>
        </>
      }
    >
      <DrawerSection title={_t('ข้อมูลหลัก')}>
        <KeyValues
          items={[
            [_t('รหัสปัจจุบัน'), <Mono key="c" dark>{m.code}</Mono>],
            [
              _t('รหัสเดิม'),
              changed ? (
                <span key="l">
                  <Mono>{m.legacyCode}</Mono>
                  {m.idChange ? ` · ${m.idChange}` : null}
                </span>
              ) : (
                _t('ไม่เปลี่ยน')
              ),
            ],
            [_t('คำอธิบาย'), m.description],
            [_t('ประเภท'), m.kind],
          ]}
        />
      </DrawerSection>
      <DrawerSection title={_t('หมวด')}>
        <KeyValues
          items={[
            [
              _t('หมวดปัจจุบัน'),
              m.currentCategory || m.currentCategoryCode ? (
                <span key="cur">
                  {m.currentCategory} {m.currentCategoryCode ? <Mono>{m.currentCategoryCode}</Mono> : null}
                </span>
              ) : null,
            ],
            [
              _t('หมวดที่เสนอ'),
              m.proposedCode ? (
                <span key="p">
                  {m.categoryTh} <Mono>{m.proposedCode}</Mono>
                </span>
              ) : null,
            ],
            [_t('ลำดับหมวด'), [m.group, m.primary, m.secondary, m.tertiary].filter(Boolean).join(' / ')],
            ['Bible Code', m.bibleCode ? <Mono key="b">{m.bibleCode}</Mono> : null],
            [_t('หมายเหตุ'), m.note],
          ]}
        />
      </DrawerSection>
      <DrawerSection title={_t('แบรนด์ที่ใช้')}>
        <BrandCodes brands={m.brands} showAll names={brandNames()} />
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>{_t('ช่องที่เป็นเส้นประ = ยังไม่ระบุ ไม่ใช่ห้ามใช้')}</p>
      </DrawerSection>
      <DrawerSection title={_t('หน่วยและการจัดเก็บ')}>
        <KeyValues
          items={[
            [_t('หน่วยรับ / นับ'), m.unitLabel],
            [_t('อุณหภูมิ'), m.temperature],
            [_t('อัตราแปลง'), <span key="x" style={{ color: 'var(--ink-3)' }}>{_t('ยังไม่มีในไฟล์')}</span>],
          ]}
        />
      </DrawerSection>
      <DrawerSection title={_t('ที่มา')} last>
        <KeyValues
          items={[
            [_t('สถานะข้อมูล'), _t('ฉบับร่าง · รอตรวจและอนุมัติ')],
            [_t('หมวดและสถานะ'), _t('ชีต {sheet} แถว {row}', { sheet: m.sourceSheet, row: m.sourceRow })],
            [_t('รหัสเก่า–ใหม่'), m.crosswalkRow ? _t('ชีต {sheet} แถว {row}', { sheet: 'Material ID Crosswalk', row: m.crosswalkRow }) : null],
            [
              _t('แบรนด์และหน่วย'),
              m.brandSheetRow ? _t('ชีต {sheet} แถว {row}', { sheet: 'Meterials (All Brands)', row: m.brandSheetRow }) : null,
            ],
          ]}
        />
      </DrawerSection>
    </Drawer>
  );
}
