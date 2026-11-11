// Launcher: Materials and SKU (Selling) under พื้นฐาน (D-004).
import { prisma } from '@tkg/db';
import { AppFooter, LauncherGroup, Note, Tag, TopBar, fmt } from '@tkg/ui';
import { _t } from '../lib/i18n';
import { demoUser } from '../lib/user';

export const dynamic = 'force-dynamic';

async function counts() {
  try {
    const [materials, skus] = await Promise.all([
      prisma.material.count({ where: { isCancelled: false } }),
      prisma.sellingSku.count(),
    ]);
    return { materials, skus };
  } catch (e) {
    console.error('launcher: could not read counts', e);
    return null;
  }
}

export default async function Launcher() {
  const c = await counts();
  const user = demoUser();
  const badge = (n: number | undefined) => (n ? <Tag isNew>{_t('{n} รายการ', { n: fmt(n) })}</Tag> : undefined);
  return (
    <>
      <TopBar user={user} />
      <div className="launch">
        <div className="hello">
          <h1>{_t('สวัสดี, {name}', { name: user.name.split(' ')[0]! })}</h1>
          <p>{_t('เลือกแอปที่ต้องการใช้งาน')}</p>
        </div>
        <LauncherGroup
          title={_t('พื้นฐาน')}
          tiles={[
            {
              title: 'Materials',
              subtitle: _t('วัตถุดิบและวัสดุ'),
              description: _t('ทะเบียนวัตถุดิบ วัสดุ และแพ็กซื้อกลางทั้งเครือ'),
              icon: 'box',
              href: '/materials',
              isNew: true,
              badge: badge(c?.materials),
            },
            {
              title: 'SKU (Selling)',
              subtitle: _t('สินค้าขาย'),
              description: _t('ทะเบียนเมนูขาย 4 แบรนด์ พร้อมรหัส POS'),
              icon: 'utensils',
              href: '/sku',
              isNew: true,
              badge: badge(c?.skus),
            },
          ]}
        />
        {c ? (
          <Note tone="info">{_t('ข้อมูลนำเข้าจากไฟล์ Excel ทั้งหมดยังเป็นฉบับร่าง รอการตรวจและอนุมัติ')}</Note>
        ) : (
          <Note>{_t('ยังไม่ได้นำเข้าข้อมูล รัน pnpm db:import ก่อน')}</Note>
        )}
      </div>
      <AppFooter company={_t('บริษัท เอราเมง จำกัด')} />
    </>
  );
}
