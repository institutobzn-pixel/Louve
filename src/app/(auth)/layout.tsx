import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-8 text-xs text-muted-foreground">
        Plataforma de gestão para ministérios de louvor
      </p>
      <p className="mt-2 flex gap-3 text-xs text-muted-foreground">
        <Link href="/termos" className="hover:text-foreground">
          Termos de Uso
        </Link>
        <span aria-hidden>·</span>
        <Link href="/privacidade" className="hover:text-foreground">
          Política de Privacidade
        </Link>
      </p>
    </div>
  );
}
