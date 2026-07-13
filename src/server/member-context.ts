import { cookies } from "next/headers";
import { cache } from "react";

import { prisma } from "@/server/db";
import { getAuthContext, supabaseAuthEnabled } from "@/server/auth";
import { getCurrentOrganization } from "@/server/org";

const DEV_MEMBER_COOKIE = "dev-member-id";

/**
 * Resolve o músico logado no App do Músico.
 *
 * - Com Supabase Auth: o Member vinculado ao usuário da sessão (Member.userId).
 * - Sem credenciais (dev): um cookie define a identidade (seletor no topo).
 */
export const getCurrentMember = cache(async () => {
  if (supabaseAuthEnabled) {
    const auth = await getAuthContext();
    return auth?.member ?? null;
  }

  const org = await getCurrentOrganization();
  const cookieStore = await cookies();
  const devMemberId = cookieStore.get(DEV_MEMBER_COOKIE)?.value;

  if (devMemberId) {
    const member = await prisma.member.findFirst({
      where: { id: devMemberId, organizationId: org.id, isActive: true },
    });
    if (member) return member;
  }

  return prisma.member.findFirst({
    where: { organizationId: org.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });
});

export { DEV_MEMBER_COOKIE };
