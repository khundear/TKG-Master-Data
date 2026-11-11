// pnpm db:seed — reference data that does not come from the sheets (brands). Safe to run again.
import { pathToFileURL } from 'node:url';
import type { PrismaClient } from '@prisma/client';
import { BRANDS } from './reference';

export async function seed(db: PrismaClient): Promise<void> {
  for (const b of BRANDS) {
    await db.brand.upsert({
      where: { code: b.code },
      create: { code: b.code, nameTh: b.nameTh, nameEn: b.nameEn },
      update: { nameTh: b.nameTh, nameEn: b.nameEn },
    });
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { prisma } = await import('./client');
  await seed(prisma);
  console.log(`seeded ${BRANDS.length} brands`);
  await prisma.$disconnect();
}
