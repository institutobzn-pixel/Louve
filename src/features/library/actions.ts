"use server";

import { revalidatePath } from "next/cache";

import { parseDurationToSeconds } from "@/lib/format";
import { getCurrentOrganization } from "@/server/org";
import * as songService from "@/server/services/song";
import {
  songFormSchema,
  versionFormSchema,
  videoFormSchema,
  type SongFormValues,
  type VersionFormValues,
  type VideoFormValues,
} from "./schema";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateSong(songId?: string) {
  revalidatePath("/biblioteca");
  if (songId) revalidatePath(`/biblioteca/${songId}`);
}

function toSongInput(values: SongFormValues) {
  return {
    name: values.name.trim(),
    artist: values.artist?.trim() || null,
    composer: values.composer?.trim() || null,
    ccli: values.ccli?.trim() || null,
    originalKey: values.originalKey?.trim() || null,
    bpm: values.bpm ? Number(values.bpm) : null,
    durationSec: values.duration
      ? parseDurationToSeconds(values.duration)
      : null,
    language: values.language?.trim() || null,
  };
}

export async function createSongAction(
  values: SongFormValues
): Promise<ActionResult<{ id: string }>> {
  const parsed = songFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    const song = await songService.createSong(org.id, toSongInput(parsed.data));
    revalidateSong();
    return { ok: true, data: { id: song.id } };
  } catch (e) {
    console.error("createSongAction", e);
    return { ok: false, error: "Não foi possível criar a música." };
  }
}

export async function updateSongAction(
  songId: string,
  values: SongFormValues
): Promise<ActionResult> {
  const parsed = songFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await songService.updateSong(org.id, songId, toSongInput(parsed.data));
    revalidateSong(songId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("updateSongAction", e);
    return { ok: false, error: "Não foi possível salvar a música." };
  }
}

export async function deleteSongAction(songId: string): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await songService.deleteSong(org.id, songId);
    revalidateSong();
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("deleteSongAction", e);
    return {
      ok: false,
      error:
        "Não foi possível excluir — a música pode estar em uso em algum setlist.",
    };
  }
}

export async function addVersionAction(
  songId: string,
  values: VersionFormValues
): Promise<ActionResult> {
  const parsed = versionFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await songService.addSongVersion(org.id, songId, {
      label: parsed.data.label.trim(),
      key: parsed.data.key?.trim() || null,
      bpm: parsed.data.bpm ? Number(parsed.data.bpm) : null,
      notes: parsed.data.notes?.trim() || null,
      chordChartUrl: parsed.data.chordChartUrl?.trim() || null,
      chordChartText: parsed.data.chordChartText?.trim() || null,
    });
    revalidateSong(songId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("addVersionAction", e);
    return { ok: false, error: "Não foi possível criar a versão." };
  }
}

export async function updateVersionAction(
  songId: string,
  versionId: string,
  values: VersionFormValues
): Promise<ActionResult> {
  const parsed = versionFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await songService.updateSongVersion(org.id, versionId, {
      label: parsed.data.label.trim(),
      key: parsed.data.key?.trim() || null,
      bpm: parsed.data.bpm ? Number(parsed.data.bpm) : null,
      notes: parsed.data.notes?.trim() || null,
      chordChartUrl: parsed.data.chordChartUrl?.trim() || null,
      chordChartText: parsed.data.chordChartText?.trim() || null,
    });
    revalidateSong(songId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("updateVersionAction", e);
    return { ok: false, error: "Não foi possível salvar a versão." };
  }
}

export async function removeVersionAction(
  songId: string,
  versionId: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await songService.removeSongVersion(org.id, versionId);
    revalidateSong(songId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("removeVersionAction", e);
    return {
      ok: false,
      error:
        "Não foi possível excluir — a versão pode estar em uso em algum setlist.",
    };
  }
}

export async function addVideoAction(
  songId: string,
  versionId: string,
  values: VideoFormValues
): Promise<ActionResult> {
  const parsed = videoFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await songService.addSongVideo(org.id, versionId, {
      label: parsed.data.label.trim(),
      url: parsed.data.url.trim(),
    });
    revalidateSong(songId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("addVideoAction", e);
    return { ok: false, error: "Não foi possível adicionar o vídeo." };
  }
}

export async function removeVideoAction(
  songId: string,
  videoId: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await songService.removeSongVideo(org.id, videoId);
    revalidateSong(songId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("removeVideoAction", e);
    return { ok: false, error: "Não foi possível remover o vídeo." };
  }
}

export async function removeFileAction(
  songId: string,
  fileId: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await songService.removeFile(org.id, fileId);
    revalidateSong(songId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("removeFileAction", e);
    return { ok: false, error: "Não foi possível excluir o arquivo." };
  }
}
