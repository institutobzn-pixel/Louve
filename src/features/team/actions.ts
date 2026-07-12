"use server";

import { revalidatePath } from "next/cache";

import { getCurrentOrganization } from "@/server/org";
import * as memberService from "@/server/services/member";
import {
  availabilityFormSchema,
  memberFormSchema,
  memberInstrumentSchema,
  toMemberInput,
  type AvailabilityFormValues,
  type MemberFormValues,
  type MemberInstrumentValues,
} from "./schema";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateMember(memberId?: string) {
  revalidatePath("/equipe");
  if (memberId) revalidatePath(`/equipe/${memberId}`);
}

export async function createMemberAction(
  values: MemberFormValues
): Promise<ActionResult<{ id: string }>> {
  const parsed = memberFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    const member = await memberService.createMember(
      org.id,
      toMemberInput(parsed.data)
    );
    revalidateMember();
    return { ok: true, data: { id: member.id } };
  } catch (e) {
    console.error("createMemberAction", e);
    return { ok: false, error: "Não foi possível criar o músico." };
  }
}

export async function updateMemberAction(
  memberId: string,
  values: MemberFormValues
): Promise<ActionResult> {
  const parsed = memberFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await memberService.updateMember(org.id, memberId, toMemberInput(parsed.data));
    revalidateMember(memberId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("updateMemberAction", e);
    return { ok: false, error: "Não foi possível salvar o músico." };
  }
}

export async function setMemberActiveAction(
  memberId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await memberService.setMemberActive(org.id, memberId, isActive);
    revalidateMember(memberId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("setMemberActiveAction", e);
    return { ok: false, error: "Não foi possível atualizar o músico." };
  }
}

export async function addMemberInstrumentAction(
  memberId: string,
  values: MemberInstrumentValues
): Promise<ActionResult> {
  const parsed = memberInstrumentSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await memberService.addMemberInstrument(org.id, memberId, parsed.data);
    revalidateMember(memberId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("addMemberInstrumentAction", e);
    return { ok: false, error: "Não foi possível adicionar o instrumento." };
  }
}

export async function removeMemberInstrumentAction(
  memberId: string,
  instrumentId: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await memberService.removeMemberInstrument(org.id, memberId, instrumentId);
    revalidateMember(memberId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("removeMemberInstrumentAction", e);
    return { ok: false, error: "Não foi possível remover o instrumento." };
  }
}

export async function addAvailabilityAction(
  memberId: string,
  values: AvailabilityFormValues
): Promise<ActionResult> {
  const parsed = availabilityFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const org = await getCurrentOrganization();
    await memberService.addAvailability(org.id, memberId, {
      date:
        parsed.data.kind === "date" && parsed.data.date
          ? new Date(`${parsed.data.date}T12:00:00.000Z`)
          : null,
      weekday:
        parsed.data.kind === "weekday" && parsed.data.weekday !== undefined
          ? Number(parsed.data.weekday)
          : null,
      reason: parsed.data.reason?.trim() || null,
    });
    revalidateMember(memberId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("addAvailabilityAction", e);
    return { ok: false, error: "Não foi possível registrar a indisponibilidade." };
  }
}

export async function removeAvailabilityAction(
  memberId: string,
  availabilityId: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await memberService.removeAvailability(org.id, availabilityId);
    revalidateMember(memberId);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("removeAvailabilityAction", e);
    return { ok: false, error: "Não foi possível remover o registro." };
  }
}
