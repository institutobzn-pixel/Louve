import type { InstrumentCategoryKey, RoleKey } from "@prisma/client";

/**
 * Catálogo canônico de dados-semente (prompt-mestre · docs/11-roadmap.md).
 * Usado pelo seed global (prisma/seed.ts) e pelo onboarding de organizações.
 */

export const defaultRoles: Array<{ key: RoleKey; label: string }> = [
  { key: "ADMIN_GERAL", label: "Administrador Geral" },
  { key: "ADMIN", label: "Administrador" },
  { key: "LIDER_LOUVOR", label: "Líder de Louvor" },
  { key: "COORD_MUSICAL", label: "Coordenador Musical" },
  { key: "PASTOR", label: "Pastor" },
  { key: "SECRETARIO", label: "Secretário" },
  { key: "TECNICO_SOM", label: "Técnico de Som" },
  { key: "MUSICO", label: "Músico" },
];

/** Rótulos de papel indexados por chave (para selects e badges). */
export const roleLabels: Record<RoleKey, string> = Object.fromEntries(
  defaultRoles.map((r) => [r.key, r.label])
) as Record<RoleKey, string>;

export const defaultCategories: Array<{
  key: InstrumentCategoryKey;
  label: string;
  sortOrder: number;
}> = [
  { key: "LIDERANCA", label: "Ministro de Louvor", sortOrder: 1 },
  { key: "VOZ", label: "Voz", sortOrder: 2 },
  { key: "RITMO", label: "Ritmo", sortOrder: 3 },
  { key: "HARMONIA", label: "Harmonia", sortOrder: 4 },
  { key: "CORDAS", label: "Cordas", sortOrder: 5 },
  { key: "SOPROS_MADEIRA", label: "Sopros Madeira", sortOrder: 6 },
  { key: "SOPROS_METAIS", label: "Sopros Metais", sortOrder: 7 },
  { key: "PERCUSSAO_ORQUESTRAL", label: "Percussão Orquestral", sortOrder: 8 },
  { key: "PRODUCAO", label: "Produção", sortOrder: 9 },
];

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

/** Itens do checklist criados automaticamente para cada culto. */
export const defaultChecklistItems = [
  "Escala completa",
  "Setlist completo",
  "Material enviado",
  "Paleta definida",
  "Mapa definido",
  "Passagem de som",
  "Confirmações",
];

/** Tipos de culto sugeridos no onboarding de uma organização. */
export const defaultServiceTypes = [
  "Culto de Domingo",
  "Culto de Oração",
  "Ceia",
  "Vigília",
  "Evento Especial",
];
