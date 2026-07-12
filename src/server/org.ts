import { cache } from "react";

import { prisma } from "@/server/db";

/**
 * Resolve a organização (tenant) atual.
 *
 * Fase atual: single-tenant de desenvolvimento — retorna a única organização
 * do banco (criada pelo seed). Quando a autenticação entrar (Fase 5 do
 * roadmap), este helper passa a ler o `organization_id` da sessão Supabase,
 * sem que os chamadores precisem mudar.
 */
export const getCurrentOrganization = cache(async () => {
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
