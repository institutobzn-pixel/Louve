import { NextResponse } from "next/server";

import { prisma } from "@/server/db";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { createSupabaseServerClient } from "@/server/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnóstico temporário de produção (protegido por chave na URL).
 * Testa cada dependência do cadastro/login e reporta o status.
 * Remover após a ativação estar validada.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== "louve2026") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const out: Record<string, string> = {};

  out["1_env_NEXT_PUBLIC_SUPABASE_URL"] = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? "ok"
    : "FALTANDO";
  out["2_env_NEXT_PUBLIC_SUPABASE_ANON_KEY"] = process.env
    .NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? "ok"
    : "FALTANDO";
  out["3_env_SUPABASE_SERVICE_ROLE_KEY"] = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "ok"
    : "FALTANDO";
  out["4_env_DATABASE_URL"] = process.env.DATABASE_URL ? "ok" : "FALTANDO";

  // Banco (Prisma): papéis semeados?
  try {
    const roles = await prisma.role.count();
    const categories = await prisma.instrumentCategory.count();
    out["5_banco_prisma"] = `ok (${roles} papéis, ${categories} categorias)`;
  } catch (e) {
    out["5_banco_prisma"] = "ERRO: " + String((e as Error).message).slice(0, 400);
  }

  // Auth Admin (service role): consegue listar usuários?
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    out["6_auth_admin"] = error
      ? "ERRO: " + error.message
      : `ok (${data.users.length} usuário(s) na 1a página)`;
  } catch (e) {
    out["6_auth_admin"] = "ERRO: " + String((e as Error).message).slice(0, 400);
  }

  // Endpoint de login (anon key): alcançável?
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: "diagnostico@example.com",
      password: "senha-invalida-de-teste",
    });
    out["7_auth_login_endpoint"] = error
      ? `alcançável (resposta esperada: ${error.message})`
      : "ok";
  } catch (e) {
    out["7_auth_login_endpoint"] =
      "ERRO: " + String((e as Error).message).slice(0, 400);
  }

  return NextResponse.json(out);
}
