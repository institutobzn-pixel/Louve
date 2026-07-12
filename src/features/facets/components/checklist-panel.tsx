"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toggleChecklistItemAction } from "../actions";

export interface ChecklistItemView {
  id: string;
  label: string;
  isDone: boolean;
  /** Itens calculados pelo sistema (setlist, escala, visualizações). */
  auto?: {
    done: boolean;
    hint: string;
  };
}

interface ChecklistPanelProps {
  serviceId: string;
  items: ChecklistItemView[];
}

/**
 * Checklist do culto: itens automáticos refletem o estado real do
 * planejamento; os demais são marcados manualmente.
 */
export function ChecklistPanel({ serviceId, items }: ChecklistPanelProps) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  const doneCount = items.filter((item) =>
    item.auto ? item.auto.done : item.isDone
  ).length;

  async function handleToggle(item: ChecklistItemView) {
    if (item.auto) return;
    setBusy(item.id);
    const result = await toggleChecklistItemAction(
      serviceId,
      item.id,
      !item.isDone
    );
    setBusy(null);
    if (result.ok) {
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="mb-4 text-sm text-muted-foreground">
          {doneCount} de {items.length} itens concluídos
        </p>
        <ul className="space-y-2.5">
          {items.map((item) => {
            const done = item.auto ? item.auto.done : item.isDone;
            return (
              <li key={item.id} className="flex items-center gap-3 text-sm">
                <button
                  type="button"
                  disabled={Boolean(item.auto) || busy === item.id}
                  onClick={() => handleToggle(item)}
                  aria-label={`${done ? "Desmarcar" : "Marcar"} ${item.label}`}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    done
                      ? "border-success bg-success text-success-foreground"
                      : "border-input hover:border-primary",
                    item.auto ? "cursor-default" : "cursor-pointer"
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : null}
                </button>

                <span className={cn(done && "text-muted-foreground line-through")}>
                  {item.label}
                </span>

                {item.auto ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
                        <Sparkles className="h-3 w-3" /> automático
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Calculado a partir dos outros módulos do culto.
                    </TooltipContent>
                  </Tooltip>
                ) : null}

                {item.auto ? (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.auto.hint}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
