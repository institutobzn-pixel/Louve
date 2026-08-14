import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { LEGAL_UPDATED_AT } from "@/config/legal";

/** Moldura das páginas públicas de Termos e Privacidade. */
export default function LegalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/termos"
              className="text-muted-foreground hover:text-foreground"
            >
              Termos de Uso
            </Link>
            <Link
              href="/privacidade"
              className="text-muted-foreground hover:text-foreground"
            >
              Privacidade
            </Link>
          </nav>
        </div>

        <article
          className="
            space-y-4 text-sm leading-relaxed text-muted-foreground
            [&_h1]:mb-1 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-foreground
            [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground
            [&_li]:mb-1
            [&_strong]:font-medium [&_strong]:text-foreground
            [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5
          "
        >
          {children}
        </article>

        <p className="mt-10 border-t pt-4 text-xs text-muted-foreground">
          Última atualização: {LEGAL_UPDATED_AT}.
        </p>
      </div>
    </div>
  );
}
