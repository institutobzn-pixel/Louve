import { cn } from "@/lib/utils";

/**
 * Logotipo temporário — ícone abstrato relacionado à música
 * (barras de onda sonora estilizadas). Sem nome de marca definido.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4.5 w-4.5 text-primary-foreground"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <rect x="3" y="9" width="2.5" height="6" rx="1.25" fill="currentColor" />
          <rect x="8" y="5" width="2.5" height="14" rx="1.25" fill="currentColor" />
          <rect x="13" y="2" width="2.5" height="20" rx="1.25" fill="currentColor" />
          <rect x="18" y="7" width="2.5" height="10" rx="1.25" fill="currentColor" />
        </svg>
      </div>
      <span className="text-sm font-semibold tracking-tight">
        Ministério
        <span className="text-muted-foreground font-normal"> · Louvor</span>
      </span>
    </div>
  );
}
