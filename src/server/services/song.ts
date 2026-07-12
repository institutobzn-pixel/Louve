import { prisma } from "@/server/db";

/**
 * Regras de negócio da Biblioteca Musical (mínimo da Fase 2).
 * O módulo completo (versões, arquivos, tags) chega na Fase 3.
 */

export interface QuickSongInput {
  name: string;
  artist?: string | null;
  originalKey?: string | null;
  bpm?: number | null;
  durationSec?: number | null;
}

/** Cadastro rápido usado pelo SongPicker do setlist. */
export async function createQuickSong(
  organizationId: string,
  input: QuickSongInput
) {
  return prisma.song.create({
    data: { organizationId, isInLibrary: true, ...input },
  });
}

export type SongSource = "library" | "implementation";

/** Busca para o seletor de músicas (Biblioteca Oficial × Em Implantação). */
export async function searchSongs(
  organizationId: string,
  source: SongSource,
  query?: string
) {
  return prisma.song.findMany({
    where: {
      organizationId,
      isInLibrary: source === "library",
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { artist: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { versions: true },
    orderBy: { name: "asc" },
    take: 30,
  });
}
