"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarX2,
  CheckCheck,
  Plus,
  UserRoundX,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InstrumentIcon } from "@/components/shared/instrument-icon";
import { removeAssignmentAction } from "../actions";
import type { AssignmentView, ScheduleCategoryView } from "../types";
import {
  MemberPickerDialog,
  type PickerState,
} from "./member-picker-dialog";

interface ScheduleBoardProps {
  serviceId: string;
  categories: ScheduleCategoryView[];
  /** Apenas escalas ativas (substituídos ficam no histórico). */
  assignments: AssignmentView[];
}

/**
 * Escala do culto organizada pelas categorias do prompt-mestre.
 * Modelo sem convite: escalar já efetiva; o músico é notificado no app.
 * Indisponibilidade aparece como aviso, mas não impede a escalação.
 */
export function ScheduleBoard({
  serviceId,
  categories,
  assignments,
}: ScheduleBoardProps) {
  const router = useRouter();
  const [picker, setPicker] = React.useState<PickerState | null>(null);

  const byCategory = new Map<string, AssignmentView[]>();
  for (const assignment of assignments) {
    const list = byCategory.get(assignment.categoryKey) ?? [];
    list.push(assignment);
    byCategory.set(assignment.categoryKey, list);
  }

  const unavailable = assignments.filter((a) => a.unavailableReason).length;

  async function handleRemove(assignment: AssignmentView) {
    const result = await removeAssignmentAction(serviceId, assignment.id);
    if (result.ok) {
      toast.success("Removido da escala.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <UsersRound className="h-4 w-4" />
          {assignments.length} escalado{assignments.length === 1 ? "" : "s"}
        </span>
        {unavailable > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-warning">
            <CalendarX2 className="h-4 w-4" />
            {unavailable} com indisponibilidade
          </span>
        ) : null}
      </div>

      {categories.map((category) => {
        const items = byCategory.get(category.key) ?? [];
        return (
          <section key={category.key}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {category.label}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPicker({ category })}
              >
                <Plus /> Escalar
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
                Ninguém escalado em {category.label}.
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((assignment) => {
                  const memberName = assignment.memberName;
                  return (
                    <li
                      key={assignment.id}
                      className="flex items-center gap-3 rounded-xl border bg-card p-3 animate-fade-in-up"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-900 text-white shadow-sm ring-1 ring-violet-500/40"
                        title={assignment.instrumentName}
                      >
                        <InstrumentIcon
                          name={assignment.instrumentName}
                          categoryKey={assignment.categoryKey}
                          className="h-[18px] w-[18px]"
                        />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {memberName ?? "Vaga em aberto"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.instrumentName}
                        </p>
                      </div>

                      {assignment.unavailableReason ? (
                        <Badge variant="warning" className="gap-1">
                          <CalendarX2 className="h-3 w-3" />
                          {assignment.unavailableReason}
                        </Badge>
                      ) : null}

                      {memberName ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={
                                assignment.seen
                                  ? "text-success"
                                  : "text-muted-foreground/50"
                              }
                              aria-label={
                                assignment.seen
                                  ? "Visualizou a escala"
                                  : "Ainda não viu a escala"
                              }
                            >
                              <CheckCheck className="h-4 w-4" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {assignment.seen
                              ? "Visualizou a escala no app"
                              : "Ainda não viu a escala"}
                          </TooltipContent>
                        </Tooltip>
                      ) : null}

                      {memberName ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPicker({
                              category,
                              substituteFor: {
                                assignmentId: assignment.id,
                                instrumentId: assignment.instrumentId,
                                memberName,
                              },
                            })
                          }
                        >
                          <UserRoundX />
                          Substituir
                        </Button>
                      ) : null}

                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remover da escala"
                        className="text-muted-foreground hover:text-danger"
                        onClick={() => handleRemove(assignment)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      <MemberPickerDialog
        serviceId={serviceId}
        state={picker}
        onClose={() => setPicker(null)}
      />
    </div>
  );
}
