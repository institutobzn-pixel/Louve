import type { InstrumentCategoryKey } from "@prisma/client";

import { prisma } from "@/server/db";
import {
  defaultInstruments,
  defaultServiceTypes,
} from "@/config/defaults";

/**
 * Provisiona uma organização recém-criada: catálogo de instrumentos e
 * tipos de culto padrão (as categorias e papéis são globais, semeados uma vez).
 */
export async function provisionOrganization(organizationId: string) {
  const categories = await prisma.instrumentCategory.findMany();
  const byKey = new Map(categories.map((c) => [c.key, c.id]));

  for (const [categoryKey, instruments] of Object.entries(
    defaultInstruments
  ) as Array<
    [InstrumentCategoryKey, Array<{ name: string; isVocal?: boolean }>]
  >) {
    const categoryId = byKey.get(categoryKey);
    if (!categoryId) continue;

    let sortOrder = 0;
    for (const instrument of instruments) {
      await prisma.instrument.upsert({
        where: {
          organizationId_categoryId_name: {
            organizationId,
            categoryId,
            name: instrument.name,
          },
        },
        update: {},
        create: {
          organizationId,
          categoryId,
          name: instrument.name,
          isVocal: instrument.isVocal ?? false,
          sortOrder: sortOrder++,
        },
      });
    }
  }

  for (const name of defaultServiceTypes) {
    const exists = await prisma.serviceType.findFirst({
      where: { organizationId, name },
    });
    if (!exists) {
      await prisma.serviceType.create({ data: { organizationId, name } });
    }
  }
}
