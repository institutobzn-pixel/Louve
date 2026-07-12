"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

import { DEV_MEMBER_COOKIE } from "@/server/member-context";
import { getCurrentOrganization } from "@/server/org";
import { prisma } from "@/server/db";
import * as musicianService from "@/server/services/musician";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const decisionSchema = z.enum(["CONFIRMADO", "RECUSADO"]);

export async function respondPresenceAction(
  memberId: string,
  assignmentId: string,
  decision: string
): Promise<ActionResult> {
  const parsed = decisionSchema.safeParse(decision);
  if (!parsed.success) return { ok: false, error: "Resposta inválida" };

  try {
    const org = await getCurrentOrganization();
    await musicianService.respondToAssignment(
      org.id,
      memberId,
      assignmentId,
      parsed.data
    );
    revalidatePath("/musico");
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("respondPresenceAction", e);
    return { ok: false, error: "Não foi possível registrar sua resposta." };
  }
}

/** Troca a identidade de desenvolvimento (até o Supabase Auth entrar). */
export async function setDevMemberAction(
  memberId: string
): Promise<ActionResult> {
  try {
    const org = await getCurrentOrganization();
    await prisma.member.findFirstOrThrow({
      where: { id: memberId, organizationId: org.id, isActive: true },
    });
    const cookieStore = await cookies();
    cookieStore.set(DEV_MEMBER_COOKIE, memberId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    revalidatePath("/musico");
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("setDevMemberAction", e);
    return { ok: false, error: "Não foi possível trocar de músico." };
  }
}
