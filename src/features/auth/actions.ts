"use server";

import { prisma } from "@/server/db";
import { createSupabaseServerClient } from "@/server/supabase/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { provisionOrganization } from "@/server/services/onboarding";
import {
  signInSchema,
  signUpSchema,
  slugify,
  type SignInValues,
  type SignUpValues,
} from "./schema";

type ActionResult<T = { redirectTo: string }> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function uniqueSlug(base: string) {
  const root = slugify(base) || "igreja";
  let slug = root;
  let n = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

/** Onboarding: cria igreja + usuário admin, provisiona e já loga. */
export async function signUpAction(
  values: SignUpValues
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const { churchName, name, email, password } = parsed.data;

  const admin = createSupabaseAdminClient();

  // 1) Cria o usuário de autenticação já confirmado.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (createError || !created.user) {
    const already = createError?.message?.toLowerCase().includes("already");
    return {
      ok: false,
      error: already
        ? "Já existe uma conta com este e-mail."
        : "Não foi possível criar a conta.",
    };
  }

  const authId = created.user.id;

  // 2) Cria organização + usuário (ADMIN_GERAL) e provisiona o catálogo.
  try {
    const adminRole = await prisma.role.findUniqueOrThrow({
      where: { key: "ADMIN_GERAL" },
    });
    const org = await prisma.organization.create({
      data: { name: churchName.trim(), slug: await uniqueSlug(churchName) },
    });
    await prisma.user.create({
      data: {
        id: authId,
        organizationId: org.id,
        email,
        name: name.trim(),
        roles: { create: { roleId: adminRole.id } },
      },
    });
    await provisionOrganization(org.id);
  } catch (e) {
    // Desfaz o usuário de auth se o provisionamento falhar.
    console.error("signUpAction provisioning", e);
    await admin.auth.admin.deleteUser(authId).catch(() => {});
    return { ok: false, error: "Não foi possível concluir o cadastro." };
  }

  // 3) Estabelece a sessão (cookies).
  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    return { ok: true, data: { redirectTo: "/login" } };
  }

  return { ok: true, data: { redirectTo: "/dashboard" } };
}

export async function signInAction(
  values: SignInValues
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) {
    return { ok: false, error: "E-mail ou senha inválidos." };
  }

  // Direciona o músico para o app dele; demais para a gestão.
  const dbUser = await prisma.user.findUnique({
    where: { id: data.user.id },
    include: { roles: { include: { role: true } } },
  });
  const musicianOnly =
    !!dbUser &&
    dbUser.roles.length > 0 &&
    dbUser.roles.every((r) => r.role.key === "MUSICO");

  return {
    ok: true,
    data: { redirectTo: musicianOnly ? "/musico" : "/dashboard" },
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
