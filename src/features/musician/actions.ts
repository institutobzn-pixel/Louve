"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { DEV_MEMBER_COOKIE } from "@/server/member-context";
import { getCurrentOrganization } from "@/server/org";
import { prisma } from "@/server/db";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

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
