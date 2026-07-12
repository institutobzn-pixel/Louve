"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentOrganization } from "@/server/org";
import * as implService from "@/server/services/implementation";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const newImplSchema = z.object({
  name: z.string().min(1, "Informe o nome da música").max(200),
  artist: z.string().max(120).optional(),
  originalKey: z.string().max(8).optional(),
  bpm: z.string().regex(/^\d{0,3}$/, "BPM inválido").optional(),
  notes: z.string().max(1000).optional(),
});

export type NewImplFormValues = z.infer<typeof newImplSchema>;

const stageSchema = z.enum([
  "EM_ANALISE",
  "APROVADA",
  "EM_ESTUDO",
  "ENSAIANDO",
  "PRONTA",
  "IMPLANTADA",
]);

export async function createImplementationAction(
  values: NewImplFormValues
): Promise<ActionResult> {
  const parsed = newImplSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await implService.createImplementation(org.id, {
      name: parsed.data.name.trim(),
      artist: parsed.data.artist?.trim() || null,
      originalKey: parsed.data.originalKey?.trim() || null,
      bpm: parsed.data.bpm ? Number(parsed.data.bpm) : null,
      notes: parsed.data.notes?.trim() || null,
    });
    revalidatePath("/implantacao");
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("createImplementationAction", e);
    return { ok: false, error: "Não foi possível adicionar a música." };
  }
}

export async function moveStageAction(
  implementationId: string,
  stage: string,
  position: number
): Promise<ActionResult<{ implanted: boolean }>> {
  const parsed = stageSchema.safeParse(stage);
  if (!parsed.success) return { ok: false, error: "Etapa inválida" };
  try {
    const org = await getCurrentOrganization();
    await implService.moveStage(org.id, implementationId, parsed.data, position);
    revalidatePath("/implantacao");
    revalidatePath("/biblioteca");
    return { ok: true, data: { implanted: parsed.data === "IMPLANTADA" } };
  } catch (e) {
    console.error("moveStageAction", e);
    return { ok: false, error: "Não foi possível mover a música." };
  }
}

export async function removeImplementationAction(
  implementationId: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await implService.removeImplementation(org.id, implementationId);
    revalidatePath("/implantacao");
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("removeImplementationAction", e);
    return { ok: false, error: "Não foi possível remover a música." };
  }
}
