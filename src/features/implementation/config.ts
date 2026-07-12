import type { ImplementationStage } from "@prisma/client";

/** Configuração visual do pipeline de implantação (docs/06). */
export const stageConfig: Record<
  ImplementationStage,
  { label: string; hint: string; accent: string }
> = {
  EM_ANALISE: {
    label: "Em análise",
    hint: "Avaliando se entra no repertório",
    accent: "bg-muted-foreground",
  },
  APROVADA: {
    label: "Aprovada",
    hint: "Vai ser trabalhada",
    accent: "bg-primary",
  },
  EM_ESTUDO: {
    label: "Em estudo",
    hint: "Levantando arranjos e tons",
    accent: "bg-primary",
  },
  ENSAIANDO: {
    label: "Ensaiando",
    hint: "Em ensaio pela equipe",
    accent: "bg-warning",
  },
  PRONTA: {
    label: "Pronta",
    hint: "Pronta para o culto",
    accent: "bg-success",
  },
  IMPLANTADA: {
    label: "Implantada",
    hint: "Migra para a Biblioteca",
    accent: "bg-success",
  },
};

export const orderedStages: ImplementationStage[] = [
  "EM_ANALISE",
  "APROVADA",
  "EM_ESTUDO",
  "ENSAIANDO",
  "PRONTA",
  "IMPLANTADA",
];
