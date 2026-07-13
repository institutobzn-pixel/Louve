import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com service_role — SOMENTE servidor.
 * Usado no onboarding (criar o usuário de autenticação já confirmado).
 * Nunca importar em código de cliente.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
