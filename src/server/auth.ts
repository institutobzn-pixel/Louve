import { cache } from "react";

import { prisma } from "@/server/db";
import { createSupabaseServerClient } from "@/server/supabase/server";

export const supabaseAuthEnabled = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Contexto do usuário autenticado (Supabase Auth) + vínculo de tenant do
 * nosso banco (User → Organization, papéis, Member).
 *
 * Sem Supabase configurado (dev sem credenciais), retorna null e os
 * resolvedores de tenant caem no modo de desenvolvimento.
 */
export const getAuthContext = cache(async () => {
  if (!supabaseAuthEnabled) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      organization: true,
      roles: { include: { role: true } },
      member: true,
    },
  });
  if (!dbUser) return null;

  return {
    authId: user.id,
    email: dbUser.email,
    name: dbUser.name,
    organization: dbUser.organization,
    roles: dbUser.roles.map((r) => r.role.key),
    member: dbUser.member,
    isMusicianOnly:
      dbUser.roles.length > 0 &&
      dbUser.roles.every((r) => r.role.key === "MUSICO"),
  };
});

export type AuthContext = NonNullable<
  Awaited<ReturnType<typeof getAuthContext>>
>;
