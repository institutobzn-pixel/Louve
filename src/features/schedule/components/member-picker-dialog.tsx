"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarX2, Loader2, Star, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { skillLevelLabels } from "@/features/team/schema";
import { assignMemberAction, getSuggestionsAction } from "../actions";
import type { ScheduleCategoryView } from "../types";

type Suggestion = Awaited<ReturnType<typeof getSuggestionsAction>>[number];

export interface PickerState {
  category: ScheduleCategoryView;
  /** Preenchido quando é uma substituição de um escalado que recusou. */
  substituteFor?: {
    assignmentId: string;
    instrumentId: string;
    memberName: string;
  };
}

interface MemberPickerDialogProps {
  serviceId: string;
  state: PickerState | null;
  onClose: () => void;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Seletor de músico para a escala: escolhe a função da categoria e mostra
 * as sugestões ranqueadas (função × disponibilidade × histórico).
 */
export function MemberPickerDialog({
  serviceId,
  state,
  onClose,
}: MemberPickerDialogProps) {
  const router = useRouter();
  const [instrumentId, setInstrumentId] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Suggestion[] | null>(
    null
  );
  const [assigning, setAssigning] = React.useState<string | null>(null);

  const isSubstitution = Boolean(state?.substituteFor);

  // Função inicial: a do substituído, ou a primeira da categoria.
  React.useEffect(() => {
    if (!state) return;
    setInstrumentId(
      state.substituteFor?.instrumentId ?? state.category.instruments[0]?.id ?? ""
    );
  }, [state]);

  // Carrega sugestões ao abrir/trocar de função.
  React.useEffect(() => {
    if (!state || !instrumentId) return;
    let cancelled = false;
    setSuggestions(null);
    getSuggestionsAction(serviceId, instrumentId).then((result) => {
      if (!cancelled) setSuggestions(result);
    });
    return () => {
      cancelled = true;
    };
  }, [state, serviceId, instrumentId]);

  async function handleAssign(suggestion: Suggestion) {
    setAssigning(suggestion.memberId);
    const result = await assignMemberAction(serviceId, {
      instrumentId,
      memberId: suggestion.memberId,
      substituteForId: state?.substituteFor?.assignmentId ?? null,
    });
    setAssigning(null);
    if (result.ok) {
      toast.success(
        isSubstitution
          ? `${suggestion.name} entra no lugar de ${state?.substituteFor?.memberName}.`
          : `${suggestion.name} escalado(a).`
      );
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isSubstitution
              ? `Substituir ${state?.substituteFor?.memberName}`
              : `Escalar · ${state?.category.label}`}
          </DialogTitle>
          <DialogDescription>
            Sugestões ordenadas por disponibilidade, instrumento principal,
            nível e carga recente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>Função</Label>
          <Select value={instrumentId} onValueChange={setInstrumentId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a função" />
            </SelectTrigger>
            <SelectContent>
              {state?.category.instruments.map((instrument) => (
                <SelectItem key={instrument.id} value={instrument.id}>
                  {instrument.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-2 space-y-1.5">
          {suggestions === null ? (
            <>
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </>
          ) : suggestions.length === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum músico cadastrado com esta função.
              <br />
              Defina instrumentos no perfil do músico (módulo Equipe).
            </p>
          ) : (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.memberId}
                type="button"
                disabled={assigning !== null || suggestion.alreadyInService}
                onClick={() => handleAssign(suggestion)}
                className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {initials(suggestion.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-medium">
                      {suggestion.name}
                    </span>
                    {suggestion.isPrimary ? (
                      <Star className="h-3.5 w-3.5 text-primary" />
                    ) : null}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {skillLevelLabels[
                      suggestion.level as keyof typeof skillLevelLabels
                    ] ?? suggestion.level}
                    {" · "}
                    {suggestion.recentAssignments} escala
                    {suggestion.recentAssignments === 1 ? "" : "s"} em 90 dias
                  </span>
                </span>
                <span className="shrink-0">
                  {suggestion.alreadyInService ? (
                    <Badge variant="secondary">Já escalado</Badge>
                  ) : suggestion.available ? (
                    <Badge variant="success">Disponível</Badge>
                  ) : (
                    <Badge variant="danger" className="gap-1">
                      <CalendarX2 className="h-3 w-3" />
                      {suggestion.unavailableReason ?? "Indisponível"}
                    </Badge>
                  )}
                </span>
                {assigning === suggestion.memberId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserRound className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
