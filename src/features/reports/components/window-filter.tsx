import Link from "next/link";

import { cn } from "@/lib/utils";

interface WindowFilterProps {
  current: "3m" | "12m";
}

const options: Array<{ value: "3m" | "12m"; label: string }> = [
  { value: "3m", label: "Últimos 3 meses" },
  { value: "12m", label: "Últimos 12 meses" },
];

/** Alterna a janela dos relatórios via query param (RSC-friendly). */
export function WindowFilter({ current }: WindowFilterProps) {
  return (
    <div className="inline-flex rounded-lg bg-muted p-1">
      {options.map((option) => {
        const active = option.value === current;
        return (
          <Link
            key={option.value}
            href={`/relatorios?w=${option.value}`}
            scroll={false}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
