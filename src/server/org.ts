import { cache } from "react";

import { prisma } from "@/server/db";
import { getAuthContext, supabaseAuthEnabled } from "@/server/auth";

/**
 * Resolve a organização (tenant) atual.
 *
 * - Com Supabase Auth: a organização do usuário logado (multi-tenant real).
 * - Sem credenciais (dev): a única organização do banco (seed).
 */
export const getCurrentOrganization = cache(async () => {
  if (supabaseAuthEnabled) {
    const auth = await getAuthContext();
    if (auth) return auth.organization;
    throw new Error("Sessão sem organização — faça login.");
  }

  const org = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!org) {
    throw new Error(
      "Nenhuma organização encontrada. Rode `npm run db:seed` para criar a organização demo."
    );
  }
  return org;
});
