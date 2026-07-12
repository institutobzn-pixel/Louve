import { prisma } from "@/server/db";

/**
 * Regras de negócio do Setlist (docs/04 e 08).
 * Cada culto tem UM setlist; itens ordenados por `position`.
 * O isolamento de tenant é verificado via join com o culto.
 */

async function getOwnedSetlist(organizationId: string, setlistId: string) {
  return prisma.setlist.findFirstOrThrow({
    where: { id: setlistId, service: { organizationId } },
  });
}

async function getOwnedItem(organizationId: string, itemId: string) {
  return prisma.setlistItem.findFirstOrThrow({
    where: { id: itemId, setlist: { service: { organizationId } } },
  });
}

export async function addSongToSetlist(
  organizationId: string,
  serviceId: string,
  input: { songId: string; versionId?: string | null }
) {
  const setlist = await prisma.setlist.findFirstOrThrow({
    where: { serviceId, service: { organizationId } },
    include: { items: { select: { position: true } } },
  });

  const song = await prisma.song.findFirstOrThrow({
    where: { id: input.songId, organizationId },
  });

  const nextPosition =
    setlist.items.reduce((max, item) => Math.max(max, item.position), -1) + 1;

  return prisma.setlistItem.create({
    data: {
      setlistId: setlist.id,
      songId: song.id,
      versionId: input.versionId ?? null,
      position: nextPosition,
      // Herda os padrões da música; o líder ajusta por culto se quiser.
      keyOverride: song.originalKey,
      bpmOverride: song.bpm,
      durationSec: song.durationSec,
    },
  });
}

export interface SetlistItemUpdate {
  versionId?: string | null;
  keyOverride?: string | null;
  bpmOverride?: number | null;
  durationSec?: number | null;
  notes?: string | null;
}

export async function updateSetlistItem(
  organizationId: string,
  itemId: string,
  input: SetlistItemUpdate
) {
  await getOwnedItem(organizationId, itemId);
  return prisma.setlistItem.update({ where: { id: itemId }, data: input });
}

export async function removeSetlistItem(
  organizationId: string,
  itemId: string
) {
  await getOwnedItem(organizationId, itemId);
  return prisma.setlistItem.delete({ where: { id: itemId } });
}

/** Persiste a nova ordem após o drag-and-drop. */
export async function reorderSetlist(
  organizationId: string,
  setlistId: string,
  orderedItemIds: string[]
) {
  await getOwnedSetlist(organizationId, setlistId);

  await prisma.$transaction(
    orderedItemIds.map((id, index) =>
      prisma.setlistItem.update({
        where: { id, setlistId },
        data: { position: index },
      })
    )
  );
}
