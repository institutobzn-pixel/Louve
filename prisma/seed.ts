/**
 * Seed global: papéis (RBAC), categorias de instrumento e — se nenhuma
 * organização existir — uma organização demo completa para desenvolvimento.
 *
 * Executar: npm run db:seed
 */
import { PrismaClient, type InstrumentCategoryKey } from "@prisma/client";

import {
  defaultRoles,
  defaultCategories,
  defaultInstruments,
  defaultServiceTypes,
} from "../src/config/defaults";

const prisma = new PrismaClient();

/** Semeia catálogo de instrumentos e tipos de culto para uma organização. */
async function seedOrganizationDefaults(organizationId: string) {
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

async function main() {
  for (const role of defaultRoles) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: { label: role.label },
      create: { key: role.key, label: role.label, permissions: {} },
    });
  }
  console.log(`✓ ${defaultRoles.length} papéis`);

  for (const category of defaultCategories) {
    await prisma.instrumentCategory.upsert({
      where: { key: category.key },
      update: { label: category.label, sortOrder: category.sortOrder },
      create: category,
    });
  }
  console.log(`✓ ${defaultCategories.length} categorias de instrumento`);

  // Organização demo apenas para desenvolvimento. Em produção (com auth),
  // a organização real é criada no cadastro — rode com SEED_DEMO=false.
  if (process.env.SEED_DEMO === "false") {
    console.log("• SEED_DEMO=false — pulando organização demo");
    return;
  }
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "Igreja Demo", slug: "demo" },
    });
    console.log(`✓ organização demo criada (${org.slug})`);
  }
  await seedOrganizationDefaults(org.id);
  console.log(`✓ instrumentos e tipos de culto da organização "${org.name}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
