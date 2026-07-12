"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Star, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  addMemberInstrumentAction,
  removeMemberInstrumentAction,
} from "../actions";
import { skillLevelLabels, skillLevels } from "../schema";

export interface InstrumentCategoryOption {
  key: string;
  label: string;
  instruments: Array<{ id: string; name: string }>;
}

export interface MemberInstrumentView {
  instrumentId: string;
  instrumentName: string;
  categoryLabel: string;
  isPrimary: boolean;
  level: keyof typeof skillLevelLabels;
}

interface InstrumentsEditorProps {
  memberId: string;
  current: MemberInstrumentView[];
  options: InstrumentCategoryOption[];
}

export function InstrumentsEditor({
  memberId,
  current,
  options,
}: InstrumentsEditorProps) {
  const router = useRouter();
  const [instrumentId, setInstrumentId] = React.useState("");
  const [isPrimary, setIsPrimary] = React.useState(false);
  const [level, setLevel] =
    React.useState<(typeof skillLevels)[number]>("INTERMEDIARIO");
  const [busy, setBusy] = React.useState(false);

  const assignedIds = new Set(current.map((c) => c.instrumentId));

  async function handleAdd() {
    if (!instrumentId) {
      toast.error("Selecione o instrumento.");
      return;
    }
    setBusy(true);
    const result = await addMemberInstrumentAction(memberId, {
      instrumentId,
      isPrimary,
      level,
    });
    setBusy(false);
    if (result.ok) {
      toast.success("Instrumento adicionado.");
      setInstrumentId("");
      setIsPrimary(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleRemove(view: MemberInstrumentView) {
    const result = await removeMemberInstrumentAction(
      memberId,
      view.instrumentId
    );
    if (result.ok) {
      toast.success(`${view.instrumentName} removido.`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      {current.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum instrumento definido ainda.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {current.map((mi) => (
            <li key={mi.instrumentId}>
              <Badge
                variant={mi.isPrimary ? "default" : "secondary"}
                className="gap-1.5 py-1 pl-2.5 pr-1.5 text-xs"
              >
                {mi.isPrimary ? <Star className="h-3 w-3" /> : null}
                {mi.instrumentName}
                <span className="opacity-70">
                  · {skillLevelLabels[mi.level]}
                </span>
                <button
                  type="button"
                  aria-label={`Remover ${mi.instrumentName}`}
                  className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                  onClick={() => handleRemove(mi)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 rounded-xl border bg-muted/40 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label>Instrumento / função</Label>
          <Select value={instrumentId} onValueChange={setInstrumentId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent>
              {options.map((category) => (
                <SelectGroup key={category.key}>
                  <SelectLabel>{category.label}</SelectLabel>
                  {category.instruments.map((instrument) => (
                    <SelectItem
                      key={instrument.id}
                      value={instrument.id}
                      disabled={assignedIds.has(instrument.id)}
                    >
                      {instrument.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Nível</Label>
          <Select
            value={level}
            onValueChange={(v) => setLevel(v as typeof level)}
          >
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skillLevels.map((lvl) => (
                <SelectItem key={lvl} value={lvl}>
                  {skillLevelLabels[lvl]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 pb-2">
          <Switch
            id="mi-primary"
            checked={isPrimary}
            onCheckedChange={setIsPrimary}
          />
          <Label htmlFor="mi-primary" className="cursor-pointer">
            Principal
          </Label>
        </div>

        <Button onClick={handleAdd} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Plus />}
          Adicionar
        </Button>
      </div>
    </div>
  );
}
