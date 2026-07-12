"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarX2, Loader2, Plus, Repeat, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateShort } from "@/lib/format";
import { addAvailabilityAction, removeAvailabilityAction } from "../actions";
import { weekdays } from "../schema";

export interface AvailabilityView {
  id: string;
  date: string | null; // ISO
  weekday: number | null;
  reason: string | null;
}

interface AvailabilityEditorProps {
  memberId: string;
  entries: AvailabilityView[];
}

/** Registro de indisponibilidades: data pontual ou dia da semana recorrente. */
export function AvailabilityEditor({
  memberId,
  entries,
}: AvailabilityEditorProps) {
  const router = useRouter();
  const [kind, setKind] = React.useState<"date" | "weekday">("date");
  const [date, setDate] = React.useState("");
  const [weekday, setWeekday] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function handleAdd() {
    setBusy(true);
    const result = await addAvailabilityAction(memberId, {
      kind,
      date: kind === "date" ? date : undefined,
      weekday: kind === "weekday" ? weekday : undefined,
      reason,
    });
    setBusy(false);
    if (result.ok) {
      toast.success("Indisponibilidade registrada.");
      setDate("");
      setWeekday("");
      setReason("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleRemove(entry: AvailabilityView) {
    const result = await removeAvailabilityAction(memberId, entry.id);
    if (result.ok) {
      toast.success("Registro removido.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma indisponibilidade registrada — o músico está disponível para
          qualquer data.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-xl border bg-card p-3 text-sm"
            >
              {entry.date ? (
                <CalendarX2 className="h-4 w-4 shrink-0 text-warning" />
              ) : (
                <Repeat className="h-4 w-4 shrink-0 text-warning" />
              )}
              <span className="flex-1">
                {entry.date
                  ? `Indisponível em ${formatDateShort(new Date(entry.date))}`
                  : `Indisponível às ${weekdays[entry.weekday ?? 0]}s`}
                {entry.reason ? (
                  <span className="text-muted-foreground">
                    {" "}
                    — {entry.reason}
                  </span>
                ) : null}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remover indisponibilidade"
                className="text-muted-foreground hover:text-danger"
                onClick={() => handleRemove(entry)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
        <Tabs value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
          <TabsList>
            <TabsTrigger value="date">Data específica</TabsTrigger>
            <TabsTrigger value="weekday">Dia da semana</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
          {kind === "date" ? (
            <div className="space-y-1.5">
              <Label htmlFor="av-date">Data</Label>
              <Input
                id="av-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Dia da semana</Label>
              <Select value={weekday} onValueChange={setWeekday}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {weekdays.map((day, index) => (
                    <SelectItem key={day} value={String(index)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="av-reason">Motivo (opcional)</Label>
            <Input
              id="av-reason"
              placeholder="Ex.: viagem, trabalho…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <Button onClick={handleAdd} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Plus />}
            Registrar
          </Button>
        </div>
      </div>
    </div>
  );
}
