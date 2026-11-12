'use client';
// SKU detail drawer (prototype skuDrawer()). POS codes are shown as mappings (↔) to the Master Record Key.
import { _t } from '@tkg/i18n';
import { Button, Drawer, DrawerSection, Icon, KeyValues, Note, Tag, money } from '@tkg/ui';
import type { SkuRow } from '../types';
import { SalesStatusChip, Warn } from './bits';

/** Code in mono, or null so KeyValues shows its grey dash. */
const mono = (v: string | null) => (v ? <span className="mono">{v}</span> : null);
const withEn = (th: string | null, en: string | null) =>
  th || en ? (
    <>
      {th ?? en}
      {th && en ? (
        <span className="t2" style={{ display: 'inline', marginLeft: 6 }}>
          {en}
        </span>
      ) : null}
    </>
  ) : null;

export function SkuDrawer({ sku, onClose }: { sku: SkuRow | null; onClose: () => void }) {
  return (
    <Drawer
      open={!!sku}
      onClose={onClose}
      code={sku?.key}
      title={sku ? (sku.nameEn ?? sku.nameTh ?? sku.key) : ''}
      subtitle={sku?.nameEn ? sku.nameTh : undefined}
      chips={
        sku ? (
          <>
            <span className="bc">{sku.brand}</span>
            <SalesStatusChip status={sku.salesStatus} long />
            {sku.status === 'draft' ? <Tag>{_t('ร่าง')}</Tag> : null}
          </>
        ) : null
      }
      footer={
        <>
          <Button href="/sku/log" icon="clock">
            {_t('ประวัติ')}
          </Button>
          <Button href="/sku/approve" primary>
            {_t('ขอปรับ / เลิกขาย')}
          </Button>
        </>
      }
    >
      {sku ? (
        <>
          <DrawerSection title={_t('รหัส')}>
            <KeyValues
              items={[
                [_t('รหัสอ้างอิงชั่วคราว (Master Record Key)'), mono(sku.key)],
                [_t('รหัส TKG ถาวร'), sku.tkgCode ? mono(sku.tkgCode) : <Warn key="t">{_t('ยังไม่ออกรหัส')}</Warn>],
              ]}
            />
          </DrawerSection>
          <DrawerSection title={_t('หมวดกลาง')}>
            <KeyValues
              items={[
                [_t('ประเภท'), sku.l1 ?? <Warn key="l1">{_t('ยังไม่ระบุ')}</Warn>],
                [_t('หมวด'), withEn(sku.l2Th, sku.l2En)],
                [_t('หมวดย่อย'), withEn(sku.l3Th, sku.l3En)],
                [
                  _t('SKU Category Code'),
                  sku.categoryCode ? mono(sku.categoryCode) : <Warn key="c">{_t('ยังไม่กำหนด')}</Warn>,
                ],
              ]}
            />
          </DrawerSection>
          <DrawerSection title={_t('หมวดเมนูแบรนด์')} last={!sku.mappings.length && !sku.reviewNote}>
            <KeyValues
              items={[
                [_t('หมวดเมนู'), sku.brandMenuCategory],
                [_t('หมวดย่อย'), sku.brandMenuSubcategory],
              ]}
            />
          </DrawerSection>
          {sku.mappings.map((m, i) => (
            <DrawerSection
              key={m.id}
              title={_t('การจับคู่ POS · {store}', { store: m.store })}
              last={i === sku.mappings.length - 1 && !sku.reviewNote}
            >
              <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="mono" style={{ color: 'var(--ink)' }}>{sku.key}</span>
                <span aria-hidden="true">↔</span>
                <span className="mono">{m.posInternalId ?? '—'}</span>
                <span>{_t('รหัส POS เป็นการจับคู่ ไม่ใช่รหัสของรายการ')}</span>
              </p>
              <KeyValues
                items={[
                  [_t('POS Internal ID'), mono(m.posInternalId)],
                  [_t('POS SKU Code'), mono(m.posSkuCode)],
                  [_t('ชื่อใน POS'), m.posLabel],
                  [_t('กลุ่ม / หมวด POS'), [m.posGroup, m.posCategory].filter(Boolean).join(' / ')],
                  [
                    _t('ราคา'),
                    m.price != null ? <span key="p">{_t('{price} บาท', { price: money(m.price) })}</span> : null,
                  ],
                  [_t('สถานะใน POS'), <SalesStatusChip key="s" status={m.salesStatus} long />],
                  [_t('Snapshot'), mono(m.snapshotDate)],
                ]}
              />
            </DrawerSection>
          ))}
          {sku.reviewNote ? (
            <DrawerSection title={_t('หมายเหตุการจัดหมวด')} last>
              <div style={{ margin: 0 }}>
                <Note>{sku.reviewNote}</Note>
              </div>
            </DrawerSection>
          ) : null}
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 6, alignItems: 'center' }}>
            <Icon name="info" size={14} />
            {_t('ที่มา: ชีต {sheet} แถว {row} · ข้อมูลร่าง รอตรวจและอนุมัติ', { sheet: sku.sourceSheet, row: sku.sourceRow })}
          </p>
        </>
      ) : null}
    </Drawer>
  );
}
