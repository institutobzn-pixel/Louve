import type { ImplementationStage } from "@prisma/client";

import { prisma } from "@/server/db";

/**
 * Pipeline de Implantação de Músicas (docs/04 e 06 · Fase 7).
 * Uma música em implantação é um Song com isInLibrary=false + registro de
 * pipeline. Ao chegar em IMPLANTADA, migra para a Biblioteca preservando
 * TODO o histórico (versões, arquivos, execuções permanecem no mesmo Song).
 */

export const implementationStages: ImplementationStage[] = [
  "EM_ANALISE",
  "APROVADA",
  "EM_ESTUDO",
  "ENSAIANDO",
  "PRONTA",
  "IMPLANTADA",
];

export interface NewImplementationInput {
  name: string;
  artist?: string | null;
  originalKey?: string | null;
  bpm?: number | null;
  notes?: string | null;
}

/** Cria uma música fora da biblioteca já no pipeline (Em análise). */
export async function createImplementation(
  organizationId: string,
  input: NewImplementationInput
) {
  return prisma.song.create({
    data: {
      organizationId,
      name: input.name,
      artist: input.artist,
      originalKey: input.originalKey,
      bpm: input.bpm,
      isInLibrary: false,
      implementation: {
        create: { stage: "EM_ANALISE", notes: input.notes ?? null },
      },
    },
    include: { implementation: true },
  });
}

export async function getBoard(organizationId: string) {
  const items = await prisma.songImplementation.findMany({
    where: { song: { organizationId, isInLibrary: false } },
    include: {
      song: { include: { _count: { select: { versions: true } } } },
    },
    orderBy: { position: "asc" },
  });
  return items;
}

/**
 * Move um card no board. Ao entrar em IMPLANTADA, promove à Biblioteca
 * numa transação — o histórico é preservado (mesmo Song).
 */
export async function moveStage(
  organizationId: string,
  implementationId: string,
  stage: ImplementationStage,
  position: number
) {
  const impl = await prisma.songImplementation.findFirstOrThrow({
    where: { id: implementationId, song: { organizationId } },
  });

  if (stage === "IMPLANTADA") {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.songImplementation.update({
        where: { id: impl.id },
        data: { stage, position, movedAt: new Date() },
      });
      // Migra para a Biblioteca Oficial mantendo todo o histórico.
      await tx.song.update({
        where: { id: impl.songId },
        data: { isInLibrary: true },
      });
      return updated;
    });
  }

  return prisma.songImplementation.update({
    where: { id: impl.id },
    data: { stage, position, movedAt: new Date() },
  });
}

export async function updateNotes(
  organizationId: string,
  implementationId: string,
  notes: string | null
) {
  await prisma.songImplementation.findFirstOrThrow({
    where: { id: implementationId, song: { organizationId } },
  });
  return prisma.songImplementation.update({
    where: { id: implementationId },
    data: { notes },
  });
}

export async function removeImplementation(
  organizationId: string,
  implementationId: string
) {
  const impl = await prisma.songImplementation.findFirstOrThrow({
    where: { id: implementationId, song: { organizationId } },
  });
  // Remove a música (ainda não está na biblioteca) e o registro em cascata.
  return prisma.song.delete({ where: { id: impl.songId } });
}

export type BoardItem = Awaited<ReturnType<typeof getBoard>>[number];
