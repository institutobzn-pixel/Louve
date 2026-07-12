"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, UserRoundX, UsersRound, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  removeAssignmentAction,
  updateAssignmentStatusAction,
} from "../actions";
import {
  assignmentStatusConfig,
  type AssignmentView,
  type ScheduleCategoryView,
} from "../types";
import {
  MemberPickerDialog,
  type PickerState,
} from "./member-picker-dialog";

interface ScheduleBoardProps {
  serviceId: string;
  categories: ScheduleCategoryView[];
  assignments: AssignmentView[];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Escala do culto organizada pelas categorias do prompt-mestre. */
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

  const confirmed = assignments.filter(
    (a) => a.status === "CONFIRMADO"
  ).length;
  const active = assignments.filter((a) => a.status !== "SUBSTITUIDO").length;

  async function handleStatus(assignment: AssignmentView, status: string) {
    const result = await updateAssignmentStatusAction(
      serviceId,
      assignment.id,
      status
    );
    if (result.ok) {
      toast.success("Status atualizado.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

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
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <UsersRound className="h-4 w-4" />
        {active} escalado{active === 1 ? "" : "s"} · {confirmed} confirmado
        {confirmed === 1 ? "" : "s"}
      </div>

      {categories.map((category) => {
        const items = (byCategory.get(category.key) ?? []).filter(
          (a) => a.status !== "SUBSTITUIDO"
        );
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
                  const status = assignmentStatusConfig[assignment.status];
                  const memberName = assignment.memberName;
                  return (
                    <li
                      key={assignment.id}
                      className="flex items-center gap-3 rounded-xl border bg-card p-3 animate-fade-in-up"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                          {assignment.memberName
                            ? initials(assignment.memberName)
                            : "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {assignment.memberName ?? "Vaga em aberto"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.instrumentName}
                        </p>
                      </div>

                      <Badge variant={status.variant}>{status.label}</Badge>

                      <Select
                        value={assignment.status}
                        onValueChange={(v) => handleStatus(assignment, v)}
                      >
                        <SelectTrigger
                          className="h-8 w-36 text-xs"
                          aria-label={`Status de ${assignment.memberName ?? "vaga"}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CONVIDADO">Convidado</SelectItem>
                          <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                          <SelectItem value="RECUSADO">Recusou</SelectItem>
                        </SelectContent>
                      </Select>

                      {assignment.status === "RECUSADO" && memberName ? (
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
