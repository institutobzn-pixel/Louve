/**
 * Seeds globais: papéis (RBAC) e categorias de instrumento.
 * Instrumentos são semeados por organização em `seedOrganizationInstruments`
 * (chamado no onboarding de cada igreja) — aqui exportamos o catálogo padrão.
 *
 * Executar: npm run db:seed
 */
import { PrismaClient, RoleKey, InstrumentCategoryKey } from "@prisma/client";

const prisma = new PrismaClient();

const roles: Array<{ key: RoleKey; label: string }> = [
  { key: "ADMIN_GERAL", label: "Administrador Geral" },
  { key: "ADMIN", label: "Administrador" },
  { key: "LIDER_LOUVOR", label: "Líder de Louvor" },
  { key: "COORD_MUSICAL", label: "Coordenador Musical" },
  { key: "PASTOR", label: "Pastor" },
  { key: "SECRETARIO", label: "Secretário" },
  { key: "TECNICO_SOM", label: "Técnico de Som" },
  { key: "MUSICO", label: "Músico" },
];

const categories: Array<{
  key: InstrumentCategoryKey;
  label: string;
  sortOrder: number;
}> = [
  { key: "LIDERANCA", label: "Liderança", sortOrder: 1 },
  { key: "VOZ", label: "Voz", sortOrder: 2 },
  { key: "RITMO", label: "Ritmo", sortOrder: 3 },
  { key: "HARMONIA", label: "Harmonia", sortOrder: 4 },
  { key: "CORDAS", label: "Cordas", sortOrder: 5 },
  { key: "SOPROS_MADEIRA", label: "Sopros Madeira", sortOrder: 6 },
  { key: "SOPROS_METAIS", label: "Sopros Metais", sortOrder: 7 },
  { key: "PERCUSSAO_ORQUESTRAL", label: "Percussão Orquestral", sortOrder: 8 },
  { key: "PRODUCAO", label: "Produção", sortOrder: 9 },
];

/** Catálogo padrão de instrumentos/funções por categoria (prompt-mestre). */
export const defaultInstruments: Record<
  InstrumentCategoryKey,
  Array<{ name: string; isVocal?: boolean }>
> = {
  LIDERANCA: [{ name: "Ministro de Louvor", isVocal: true }],
  VOZ: [
    { name: "Lead Vocal", isVocal: true },
    { name: "Soprano 1", isVocal: true },
    { name: "Soprano 2", isVocal: true },
    { name: "Contralto", isVocal: true },
    { name: "Tenor 1", isVocal: true },
    { name: "Tenor 2", isVocal: true },
    { name: "Baixo", isVocal: true },
    { name: "Backing Vocal", isVocal: true },
  ],
  RITMO: [
    { name: "Bateria" },
    { name: "Percussão" },
    { name: "Cajon" },
    { name: "Pandeiro" },
    { name: "Tambor" },
  ],
  HARMONIA: [
    { name: "Violão" },
    { name: "Guitarra" },
    { name: "Teclado" },
    { name: "Piano" },
    { name: "Ukulele" },
    { name: "Acordeon" },
    { name: "Órgão" },
  ],
  CORDAS: [
    { name: "Violino" },
    { name: "Viola" },
    { name: "Violoncelo" },
    { name: "Contrabaixo Acústico" },
    { name: "Contrabaixo Elétrico" },
    { name: "Harpa" },
  ],
  SOPROS_MADEIRA: [
    { name: "Flauta" },
    { name: "Clarinete" },
    { name: "Oboé" },
    { name: "Saxofone" },
    { name: "Fagote" },
  ],
  SOPROS_METAIS: [
    { name: "Trompete" },
    { name: "Trombone" },
    { name: "Tuba" },
    { name: "Trompa" },
    { name: "Flugelhorn" },
    { name: "Eufônio" },
  ],
  PERCUSSAO_ORQUESTRAL: [
    { name: "Xilofone" },
    { name: "Marimba" },
    { name: "Glockenspiel" },
    { name: "Tímpanos" },
  ],
  PRODUCAO: [
    { name: "Técnico de Som" },
    { name: "Mídia" },
    { name: "Transmissão" },
    { name: "Iluminação" },
    { name: "Fotografia" },
    { name: "Vídeo" },
  ],
};

/** Itens padrão do checklist de cada culto (prompt-mestre). */
export const defaultChecklistItems = [
  "Escala completa",
  "Setlist completo",
  "Material enviado",
  "Paleta definida",
  "Mapa definido",
  "Passagem de som",
  "Confirmações",
];

/** Semeia o catálogo de instrumentos para uma organização recém-criada. */
export async function seedOrganizationInstruments(organizationId: string) {
  const allCategories = await prisma.instrumentCategory.findMany();
  const byKey = new Map(allCategories.map((c) => [c.key, c.id]));

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
}

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: { label: role.label },
      create: { key: role.key, label: role.label, permissions: {} },
    });
  }
  console.log(`✓ ${roles.length} papéis semeados`);

  for (const category of categories) {
    await prisma.instrumentCategory.upsert({
      where: { key: category.key },
      update: { label: category.label, sortOrder: category.sortOrder },
      create: category,
    });
  }
  console.log(`✓ ${categories.length} categorias de instrumento semeadas`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
