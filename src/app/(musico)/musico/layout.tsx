import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { DevMemberSwitcher } from "@/features/musician/components/dev-member-switcher";
import { MusicianNav } from "@/features/musician/components/musician-nav";
import { getCurrentMember } from "@/server/member-context";
import { getCurrentOrganization } from "@/server/org";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

/**
 * Shell do App do Músico — visão restrita (docs/06 e 07).
 * O seletor "visualizar como" é temporário até o Supabase Auth entrar.
 */
export default async function MusicianLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const org = await getCurrentOrganization();
  const [member, members] = await Promise.all([
    getCurrentMember(),
    prisma.member.findMany({
      where: { organizationId: org.id, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="min-h-dvh pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
          <Link href="/musico" aria-label="Início">
            <Logo />
          </Link>
          <div className="flex-1" />
          {member && members.length > 0 ? (
            <DevMemberSwitcher members={members} currentId={member.id} />
          ) : null}
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild aria-label="Ir para a gestão">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>

      <MusicianNav />
    </div>
  );
}
