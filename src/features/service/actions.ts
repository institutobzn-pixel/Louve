"use server";

import { revalidatePath } from "next/cache";

import { getCurrentOrganization } from "@/server/org";
import * as serviceService from "@/server/services/service";
import {
  serviceFormSchema,
  serviceStatusSchema,
  toServiceInput,
  type ServiceFormValues,
} from "./schema";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function createServiceAction(
  values: ServiceFormValues
): Promise<ActionResult<{ id: string }>> {
  const parsed = serviceFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const org = await getCurrentOrganization();
    const service = await serviceService.createService(
      org.id,
      toServiceInput(parsed.data)
    );
    revalidatePath("/planejamento");
    return { ok: true, data: { id: service.id } };
  } catch (e) {
    console.error("createServiceAction", e);
    return { ok: false, error: "Não foi possível criar o culto." };
  }
}

export async function updateServiceInfoAction(
  serviceId: string,
  values: ServiceFormValues
): Promise<ActionResult> {
  const parsed = serviceFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const org = await getCurrentOrganization();
    await serviceService.updateServiceInfo(
      org.id,
      serviceId,
      toServiceInput(parsed.data)
    );
    revalidatePath("/planejamento");
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("updateServiceInfoAction", e);
    return { ok: false, error: "Não foi possível salvar as alterações." };
  }
}

export async function updateServiceStatusAction(
  serviceId: string,
  status: string
): Promise<ActionResult> {
  const parsed = serviceStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Status inválido" };

  try {
    const org = await getCurrentOrganization();
    await serviceService.updateServiceStatus(org.id, serviceId, parsed.data);
    revalidatePath("/planejamento");
    revalidatePath(`/planejamento/${serviceId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("updateServiceStatusAction", e);
    return { ok: false, error: "Não foi possível atualizar o status." };
  }
}

export async function deleteServiceAction(
  serviceId: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await serviceService.deleteService(org.id, serviceId);
    revalidatePath("/planejamento");
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("deleteServiceAction", e);
    return { ok: false, error: "Não foi possível excluir o culto." };
  }
}

export async function duplicateServiceAction(
  serviceId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const org = await getCurrentOrganization();
    const copy = await serviceService.duplicateService(org.id, serviceId);
    revalidatePath("/planejamento");
    return { ok: true, data: { id: copy.id } };
  } catch (e) {
    console.error("duplicateServiceAction", e);
    return { ok: false, error: "Não foi possível duplicar o culto." };
  }
}
