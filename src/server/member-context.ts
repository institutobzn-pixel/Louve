import { cookies } from "next/headers";
import { cache } from "react";

import { prisma } from "@/server/db";
import { getCurrentOrganization } from "@/server/org";

const DEV_MEMBER_COOKIE = "dev-member-id";

/**
 * Resolve o músico logado no App do Músico.
 *
 * Fase atual (sem Supabase Auth): um cookie de desenvolvimento define
 * "quem sou eu" — o seletor no topo do app troca a identidade. Quando a
 * autenticação entrar, este helper passa a resolver via `Member.userId`
 * da sessão, sem mudar os chamadores.
 */
export const getCurrentMember = cache(async () => {
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
