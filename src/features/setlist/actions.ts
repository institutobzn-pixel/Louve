"use server";

import { revalidatePath } from "next/cache";

import { parseDurationToSeconds } from "@/lib/format";
import { getCurrentOrganization } from "@/server/org";
import * as setlistService from "@/server/services/setlist";
import * as songService from "@/server/services/song";
import {
  quickSongFormSchema,
  setlistItemFormSchema,
  type QuickSongFormValues,
  type SetlistItemFormValues,
} from "./schema";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function searchSongsAction(
  source: songService.SongSource,
  query?: string
) {
  const org = await getCurrentOrganization();
  const songs = await songService.searchSongs(org.id, source, query);
  return songs.map((song) => ({
    id: song.id,
    name: song.name,
    artist: song.artist,
    originalKey: song.originalKey,
    bpm: song.bpm,
    versions: song.versions.map((v) => ({ id: v.id, label: v.label })),
  }));
}

export async function addSongToSetlistAction(
  serviceId: string,
  songId: string,
  versionId?: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await setlistService.addSongToSetlist(org.id, serviceId, {
      songId,
      versionId,
    });
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("addSongToSetlistAction", e);
    return { ok: false, error: "Não foi possível adicionar a música." };
  }
}

export async function quickCreateSongAction(
  serviceId: string,
  values: QuickSongFormValues
): Promise<ActionResult> {
  const parsed = quickSongFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const org = await getCurrentOrganization();
    const song = await songService.createQuickSong(org.id, {
      name: parsed.data.name.trim(),
      artist: parsed.data.artist?.trim() || null,
      originalKey: parsed.data.originalKey?.trim() || null,
      bpm: parsed.data.bpm ? Number(parsed.data.bpm) : null,
      durationSec: parsed.data.duration
        ? parseDurationToSeconds(parsed.data.duration)
        : null,
    });
    await setlistService.addSongToSetlist(org.id, serviceId, {
      songId: song.id,
    });
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("quickCreateSongAction", e);
    return { ok: false, error: "Não foi possível criar a música." };
  }
}

export async function updateSetlistItemAction(
  serviceId: string,
  itemId: string,
  values: SetlistItemFormValues
): Promise<ActionResult> {
  const parsed = setlistItemFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const org = await getCurrentOrganization();
    await setlistService.updateSetlistItem(org.id, itemId, {
      versionId: parsed.data.versionId || null,
      keyOverride: parsed.data.keyOverride?.trim() || null,
      bpmOverride: parsed.data.bpm ? Number(parsed.data.bpm) : null,
      durationSec: parsed.data.duration
        ? parseDurationToSeconds(parsed.data.duration)
        : null,
      notes: parsed.data.notes?.trim() || null,
    });
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("updateSetlistItemAction", e);
    return { ok: false, error: "Não foi possível salvar o item." };
  }
}

export async function removeSetlistItemAction(
  serviceId: string,
  itemId: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await setlistService.removeSetlistItem(org.id, itemId);
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("removeSetlistItemAction", e);
    return { ok: false, error: "Não foi possível remover a música." };
  }
}

export async function reorderSetlistAction(
  serviceId: string,
  setlistId: string,
  orderedItemIds: string[]
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await setlistService.reorderSetlist(org.id, setlistId, orderedItemIds);
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("reorderSetlistAction", e);
    return { ok: false, error: "Não foi possível reordenar o setlist." };
  }
}
