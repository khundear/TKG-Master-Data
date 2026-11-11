// /ui-kit — every shared piece from @tkg/ui on real (draft) data. Reference for the module sessions; not a module page.
import { BRANDS, prisma } from '@tkg/db';
import { KitDemo, type KitMaterial } from './kit-demo';

export const dynamic = 'force-dynamic';

export default async function UiKitPage() {
  const [rows, total, cancelled, changed, none, byBrand] = await Promise.all([
    prisma.material.findMany({
      where: { isCancelled: false },
      orderBy: { sourceRow: 'asc' },
      take: 200,
      include: { brandUsages: { where: { usage: 'used' }, include: { brand: true } }, unit: true },
    }),
    prisma.material.count({ where: { isCancelled: false } }),
    prisma.material.count({ where: { isCancelled: true } }),
    prisma.$queryRaw<[{ n: bigint }]>`select count(*) as n from materials where code <> legacy_code`,
    prisma.material.count({ where: { isCancelled: false, brandUsages: { none: { usage: 'used' } } } }),
    prisma.brand.findMany({
      orderBy: { code: 'asc' },
      select: { code: true, nameTh: true, _count: { select: { materialBrandUsages: { where: { usage: 'used' } } } } },
    }),
  ]);
  const materials: KitMaterial[] = rows.map((m) => ({
    code: m.code,
    legacyCode: m.legacyCode,
    idChange: m.idChange,
    name: m.name,
    description: m.description,
    group: m.group,
    primary: m.primaryCategory,
    secondary: m.secondaryCategory,
    tertiary: m.tertiaryCategory,
    categoryTh: m.proposedCategoryNameTh,
    currentCategory: m.currentCategoryName,
    mappingStatus: m.mappingStatus,
    unit: m.unit?.nameTh ?? null,
    brands: m.brandUsages.map((u) => u.brand.code),
    sourceSheet: m.sourceSheet,
    sourceRow: m.sourceRow,
  }));
  return (
    <KitDemo
      materials={materials}
      stats={{ total, cancelled, changed: Number(changed[0].n), none }}
      brands={BRANDS.map(({ code }) => byBrand.find((b) => b.code === code)!).map((b) => ({
        code: b.code,
        name: b.nameTh,
        count: b._count.materialBrandUsages,
      }))}
    />
  );
}
