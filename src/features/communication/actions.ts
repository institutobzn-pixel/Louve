"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentOrganization } from "@/server/org";
import * as commService from "@/server/services/communication";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const roleKeys = [
  "ADMIN_GERAL",
  "ADMIN",
  "LIDER_LOUVOR",
  "COORD_MUSICAL",
  "PASTOR",
  "SECRETARIO",
  "TECNICO_SOM",
  "MUSICO",
] as const;

const announcementSchema = z.object({
  title: z.string().min(1, "Informe o título").max(160),
  body: z.string().max(4000).optional(),
  audience: z.array(z.enum(roleKeys)),
  publish: z.boolean(),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export async function createAnnouncementAction(
  values: AnnouncementFormValues
): Promise<ActionResult> {
  const parsed = announcementSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await commService.createAnnouncement(
      org.id,
      {
        title: parsed.data.title.trim(),
        body: parsed.data.body?.trim() || null,
        audience: parsed.data.audience,
      },
      parsed.data.publish
    );
    revalidatePath("/comunicacao");
    revalidatePath("/musico");
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("createAnnouncementAction", e);
    return { ok: false, error: "Não foi possível criar o aviso." };
  }
}

export async function updateAnnouncementAction(
  announcementId: string,
  values: AnnouncementFormValues
): Promise<ActionResult> {
  const parsed = announcementSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await commService.updateAnnouncement(org.id, announcementId, {
      title: parsed.data.title.trim(),
      body: parsed.data.body?.trim() || null,
      audience: parsed.data.audience,
    });
    revalidatePath("/comunicacao");
    revalidatePath("/musico");
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("updateAnnouncementAction", e);
    return { ok: false, error: "Não foi possível salvar o aviso." };
  }
}

export async function togglePublishAction(
  announcementId: string,
  publish: boolean
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await commService.setAnnouncementPublished(org.id, announcementId, publish);
    revalidatePath("/comunicacao");
    revalidatePath("/musico");
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("togglePublishAction", e);
    return { ok: false, error: "Não foi possível atualizar a publicação." };
  }
}

export async function deleteAnnouncementAction(
  announcementId: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await commService.deleteAnnouncement(org.id, announcementId);
    revalidatePath("/comunicacao");
    revalidatePath("/musico");
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("deleteAnnouncementAction", e);
    return { ok: false, error: "Não foi possível excluir o aviso." };
  }
}
