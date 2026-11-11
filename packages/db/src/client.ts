import { PrismaClient } from '@prisma/client';

// One client per process. In Next.js dev, hot reload would otherwise open a new pool on every change.
const g = globalThis as unknown as { __tkgPrisma?: PrismaClient };

export const prisma: PrismaClient = g.__tkgPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.__tkgPrisma = prisma;
