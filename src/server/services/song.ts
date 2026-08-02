import type { FileKind } from "@prisma/client";

import { prisma } from "@/server/db";
import { deleteSongFile } from "@/server/storage";

/** Regras de negócio da Biblioteca Musical (docs/04 · Fase 3). */

export interface SongInput {
  name: string;
  artist?: string | null;
  composer?: string | null;
  ccli?: string | null;
  originalKey?: string | null;
  bpm?: number | null;
  durationSec?: number | null;
  language?: string | null;
}

export async function createSong(organizationId: string, input: SongInput) {
  return prisma.song.create({
    data: { organizationId, isInLibrary: true, ...input },
  });
}

export async function updateSong(
  organizationId: string,
  songId: string,
  input: SongInput
) {
  return prisma.song.update({
    where: { id: songId, organizationId },
    data: input,
  });
}

export async function deleteSong(organizationId: string, songId: string) {
  const song = await prisma.song.findUniqueOrThrow({
    where: { id: songId, organizationId },
    include: { versions: { include: { files: true } } },
  });
  // Remove os binários antes do registro (cascade cuida das linhas).
  for (const version of song.versions) {
    for (const file of version.files) {
      await deleteSongFile(file.storagePath);
    }
  }
  return prisma.song.delete({ where: { id: songId } });
}

export async function getSongs(organizationId: string, query?: string) {
  return prisma.song.findMany({
    where: {
      organizationId,
      isInLibrary: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { artist: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      versions: { include: { _count: { select: { files: true } } } },
      _count: { select: { executions: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getSongById(organizationId: string, songId: string) {
  return prisma.song.findUnique({
    where: { id: songId, organizationId },
    include: {
      versions: {
        include: {
          files: { orderBy: { name: "asc" } },
          videos: { orderBy: { sortOrder: "asc" } },
          sections: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { label: "asc" },
      },
    },
  });
}

/* ---------- Versões ---------- */

export interface VersionInput {
  label: string;
  key?: string | null;
  bpm?: number | null;
  notes?: string | null;
  chordChartUrl?: string | null;
  chordChartText?: string | null;
}

export async function addSongVersion(
  organizationId: string,
  songId: string,
  input: VersionInput
) {
  await prisma.song.findFirstOrThrow({
    where: { id: songId, organizationId },
  });
  return prisma.songVersion.create({ data: { songId, ...input } });
}

export async function updateSongVersion(
  organizationId: string,
  versionId: string,
  input: VersionInput
) {
  await prisma.songVersion.findFirstOrThrow({
    where: { id: versionId, song: { organizationId } },
  });
  return prisma.songVersion.update({ where: { id: versionId }, data: input });
}

export async function removeSongVersion(
  organizationId: string,
  versionId: string
) {
  const version = await prisma.songVersion.findFirstOrThrow({
    where: { id: versionId, song: { organizationId } },
    include: { files: true },
  });
  for (const file of version.files) {
    await deleteSongFile(file.storagePath);
  }
  return prisma.songVersion.delete({ where: { id: versionId } });
}

/* ---------- Vídeos (YouTube) ---------- */

export async function addSongVideo(
  organizationId: string,
  versionId: string,
  input: { label: string; url: string }
) {
  await prisma.songVersion.findFirstOrThrow({
    where: { id: versionId, song: { organizationId } },
  });
  const last = await prisma.songVideo.findFirst({
    where: { versionId },
    orderBy: { sortOrder: "desc" },
  });
  return prisma.songVideo.create({
    data: {
      versionId,
      label: input.label,
      url: input.url,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
}

export async function removeSongVideo(
  organizationId: string,
  videoId: string
) {
  await prisma.songVideo.findFirstOrThrow({
    where: { id: videoId, version: { song: { organizationId } } },
  });
  return prisma.songVideo.delete({ where: { id: videoId } });
}

/* ---------- Estrutura do arranjo ---------- */

export interface SectionInput {
  name: string;
  measures?: number | null;
  notes?: string | null;
}

export async function addSongSection(
  organizationId: string,
  versionId: string,
  input: SectionInput
) {
  await prisma.songVersion.findFirstOrThrow({
    where: { id: versionId, song: { organizationId } },
  });
  const last = await prisma.songSection.findFirst({
    where: { versionId },
    orderBy: { sortOrder: "desc" },
  });
  return prisma.songSection.create({
    data: {
      versionId,
      name: input.name,
      measures: input.measures ?? null,
      notes: input.notes ?? null,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
}

export async function updateSongSection(
  organizationId: string,
  sectionId: string,
  input: SectionInput
) {
  await prisma.songSection.findFirstOrThrow({
    where: { id: sectionId, version: { song: { organizationId } } },
  });
  return prisma.songSection.update({
    where: { id: sectionId },
    data: {
      name: input.name,
      measures: input.measures ?? null,
      notes: input.notes ?? null,
    },
  });
}

export async function removeSongSection(
  organizationId: string,
  sectionId: string
) {
  await prisma.songSection.findFirstOrThrow({
    where: { id: sectionId, version: { song: { organizationId } } },
  });
  return prisma.songSection.delete({ where: { id: sectionId } });
}

/** Reordena os trechos na ordem recebida (arrastar para cima/baixo). */
export async function reorderSongSections(
  organizationId: string,
  versionId: string,
  sectionIds: string[]
) {
  await prisma.songVersion.findFirstOrThrow({
    where: { id: versionId, song: { organizationId } },
  });
  await prisma.$transaction(
    sectionIds.map((id, index) =>
      prisma.songSection.updateMany({
        where: { id, versionId },
        data: { sortOrder: index },
      })
    )
  );
}

/* ---------- Arquivos ---------- */

export async function attachSongFile(
  organizationId: string,
  versionId: string,
  input: {
    kind: FileKind;
    storagePath: string;
    name: string;
    sizeBytes: number;
    mimeType: string;
  }
) {
  await prisma.songVersion.findFirstOrThrow({
    where: { id: versionId, song: { organizationId } },
  });
  return prisma.songFile.create({ data: { versionId, ...input } });
}

export async function removeFile(organizationId: string, fileId: string) {
  const file = await prisma.songFile.findFirstOrThrow({
    where: { id: fileId, version: { song: { organizationId } } },
  });
  await deleteSongFile(file.storagePath);
  return prisma.songFile.delete({ where: { id: fileId } });
}

export async function getOwnedFile(organizationId: string, fileId: string) {
  return prisma.songFile.findFirst({
    where: { id: fileId, version: { song: { organizationId } } },
  });
}

export type SongListItem = Awaited<ReturnType<typeof getSongs>>[number];
export type SongDetail = NonNullable<Awaited<ReturnType<typeof getSongById>>>;

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
