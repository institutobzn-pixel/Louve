import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { getAuthContext, supabaseAuthEnabled } from "@/server/auth";

export const metadata: Metadata = { title: "Entrar" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (supabaseAuthEnabled) {
    const auth = await getAuthContext();
    if (auth) redirect(auth.isMusicianOnly ? "/musico" : "/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse o painel do seu ministério.</CardDescription>
      </CardHeader>
      <CardContent>
        {supabaseAuthEnabled ? (
          <SignInForm />
        ) : (
          <p className="text-sm text-muted-foreground">
            Autenticação ainda não configurada neste ambiente. Defina as
            variáveis do Supabase para habilitar o login.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
