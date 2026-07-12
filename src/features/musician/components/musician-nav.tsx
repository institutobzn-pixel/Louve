"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ListMusic, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { title: "Minha Agenda", href: "/musico", icon: CalendarDays },
  { title: "Meus Cultos", href: "/musico/cultos", icon: ListMusic },
  { title: "Perfil", href: "/musico/perfil", icon: UserRound },
];

/** Navegação inferior do App do Músico (mobile-first). */
export function MusicianNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação do músico"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-2xl items-stretch">
        {items.map((item) => {
          const active =
            item.href === "/musico"
              ? pathname === "/musico"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.75} />
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
