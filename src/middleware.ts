import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Middleware de sessão (docs/09-autenticacao-storage.md).
 * Fase 0: mantém a sessão Supabase atualizada. O gate de rotas por papel
 * (redirecionar MUSICO para o app do músico, exigir login no dashboard)
 * entra junto com as telas de auth.
 */
export async function middleware(request: NextRequest) {
  // Permite rodar o app localmente antes de configurar o Supabase.
  if (!supabaseConfigured) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Revalida o token e mantém os cookies de sessão frescos.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Tudo, exceto estáticos e assets do Next.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
