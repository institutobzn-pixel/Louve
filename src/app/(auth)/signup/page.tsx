import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { getAuthContext, supabaseAuthEnabled } from "@/server/auth";

export const metadata: Metadata = { title: "Cadastrar igreja" };
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (supabaseAuthEnabled) {
    const auth = await getAuthContext();
    if (auth) redirect(auth.isMusicianOnly ? "/musico" : "/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastre sua igreja</CardTitle>
        <CardDescription>
          Crie a conta de administrador do ministério.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {supabaseAuthEnabled ? (
          <SignUpForm />
        ) : (
          <p className="text-sm text-muted-foreground">
            Autenticação ainda não configurada neste ambiente. Defina as
            variáveis do Supabase para habilitar o cadastro.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
