"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentOrganization } from "@/server/org";
import * as scheduleService from "@/server/services/schedule";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const assignSchema = z.object({
  instrumentId: z.string().min(1, "Selecione a função"),
  memberId: z.string().min(1, "Selecione o músico"),
  isLeader: z.boolean().optional(),
  substituteForId: z.string().nullable().optional(),
});

export async function assignMemberAction(
  serviceId: string,
  values: z.infer<typeof assignSchema>
): Promise<ActionResult> {
  const parsed = assignSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await scheduleService.assignMember(org.id, serviceId, parsed.data);
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("assignMemberAction", e);
    return {
      ok: false,
      error:
        e instanceof Error && e.message.includes("já está escalado")
          ? e.message
          : "Não foi possível escalar o músico.",
    };
  }
}

export async function removeAssignmentAction(
  serviceId: string,
  assignmentId: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await scheduleService.removeAssignment(org.id, assignmentId);
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("removeAssignmentAction", e);
    return { ok: false, error: "Não foi possível remover da escala." };
  }
}

export async function getSuggestionsAction(
  serviceId: string,
  instrumentId: string
) {
  const org = await getCurrentOrganization();
  return scheduleService.suggestMembers(org.id, serviceId, instrumentId);
}
