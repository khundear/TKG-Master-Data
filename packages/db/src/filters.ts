// Shared Prisma `where` helpers for the module sessions. Filters, not tables or menus.
import type { Prisma } from '@prisma/client';
import { MATERIAL_MAPPING_STATUS } from './reference';

/** Default material list: cancelled items are hidden unless asked for. */
export const activeMaterials: Prisma.MaterialWhereInput = { isCancelled: false };

/**
 * มีหมู — materials that contain pork: secondary category PORK, or a pork word in the name of a food item (RM / SM).
 * Spare parts and supplies (group SP) are left out, so e.g. a pork-slicer spring is not "pork" (QA finding 3).
 * It is a filter on Materials, never its own menu, and it is a proposal for review, not a certified list.
 */
export const porkMaterials: Prisma.MaterialWhereInput = {
  OR: [
    { secondaryCategory: 'PORK' },
    {
      AND: [
        { OR: [{ group: null }, { group: { not: 'SP' } }] },
        { OR: ['หมู', 'เบคอน', 'แฮม', 'bacon', 'pork'].map((w) => ({ name: { contains: w, mode: 'insensitive' as const } })) },
      ],
    },
  ],
};

/** Materials a brand has specified as used (flag = 1). Absence means "not specified", never "not allowed". */
export const usedByBrand = (brandCode: string): Prisma.MaterialWhereInput => ({
  brandUsages: { some: { usage: 'used', brand: { code: brandCode } } },
});

/** Materials no brand has specified yet. */
export const noBrandSpecified: Prisma.MaterialWhereInput = { brandUsages: { none: { usage: 'used' } } };

/** Group as shown in the prototype: "คงไว้เป็น SM" counts as SM. */
export const materialGroup = (group: 'RM' | 'SP' | 'SM'): Prisma.MaterialWhereInput =>
  group === 'SM'
    ? { OR: [{ group: 'SM' }, { mappingStatus: MATERIAL_MAPPING_STATUS.keepSm }] }
    : { group, NOT: { mappingStatus: MATERIAL_MAPPING_STATUS.keepSm } };
