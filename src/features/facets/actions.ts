"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentOrganization } from "@/server/org";
import * as facetsService from "@/server/services/facets";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const noticeSchema = z.object({
  title: z.string().min(1, "Informe o título").max(120),
  body: z.string().max(2000).optional(),
});

export type NoticeFormValues = z.infer<typeof noticeSchema>;

const paletteSchema = z.object({
  colors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).max(8),
  notes: z.string().max(1000).optional(),
  referenceUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
});

export type PaletteFormValues = z.infer<typeof paletteSchema>;

const stagePositionsSchema = z.array(
  z.object({
    assignmentId: z.string().nullable().optional(),
    label: z.string().max(60).nullable().optional(),
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  })
);

export type StagePositionsInput = z.infer<typeof stagePositionsSchema>;

/* ---------- Checklist ---------- */

export async function toggleChecklistItemAction(
  serviceId: string,
  itemId: string,
  isDone: boolean
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await facetsService.toggleChecklistItem(org.id, itemId, isDone);
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("toggleChecklistItemAction", e);
    return { ok: false, error: "Não foi possível atualizar o item." };
  }
}

/* ---------- Avisos ---------- */

export async function createNoticeAction(
  serviceId: string,
  values: NoticeFormValues
): Promise<ActionResult> {
  const parsed = noticeSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await facetsService.createNotice(org.id, serviceId, {
      title: parsed.data.title.trim(),
      body: parsed.data.body?.trim() || null,
    });
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("createNoticeAction", e);
    return { ok: false, error: "Não foi possível criar o aviso." };
  }
}

export async function updateNoticeAction(
  serviceId: string,
  noticeId: string,
  values: NoticeFormValues
): Promise<ActionResult> {
  const parsed = noticeSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await facetsService.updateNotice(org.id, noticeId, {
      title: parsed.data.title.trim(),
      body: parsed.data.body?.trim() || null,
    });
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("updateNoticeAction", e);
    return { ok: false, error: "Não foi possível salvar o aviso." };
  }
}

export async function deleteNoticeAction(
  serviceId: string,
  noticeId: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await facetsService.deleteNotice(org.id, noticeId);
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("deleteNoticeAction", e);
    return { ok: false, error: "Não foi possível excluir o aviso." };
  }
}

/* ---------- Paleta de Roupas ---------- */

export async function savePaletteAction(
  serviceId: string,
  values: PaletteFormValues
): Promise<ActionResult> {
  const parsed = paletteSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await facetsService.upsertPalette(org.id, serviceId, {
      colors: parsed.data.colors,
      notes: parsed.data.notes?.trim() || null,
      referenceUrl: parsed.data.referenceUrl || null,
    });
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("savePaletteAction", e);
    return { ok: false, error: "Não foi possível salvar a paleta." };
  }
}

/* ---------- Mapa de Palco ---------- */

export async function saveStagePositionsAction(
  serviceId: string,
  positions: StagePositionsInput
): Promise<ActionResult> {
  const parsed = stagePositionsSchema.safeParse(positions);
  if (!parsed.success) {
    return { ok: false, error: "Posições inválidas" };
  }
  try {
    const org = await getCurrentOrganization();
    await facetsService.saveStagePositions(org.id, serviceId, parsed.data);
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("saveStagePositionsAction", e);
    return { ok: false, error: "Não foi possível salvar o mapa de palco." };
  }
}
