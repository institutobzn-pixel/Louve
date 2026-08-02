"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, ListTree, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StructureTimeline, type SectionView } from "@/components/shared/structure-timeline";
import {
  addSectionAction,
  removeSectionAction,
  reorderSectionsAction,
} from "../actions";
import { sectionSuggestions } from "../schema";

interface SectionEditorProps {
  songId: string;
  versionId: string;
  sections: SectionView[];
  bpm: number | null;
}

/**
 * Monta a estrutura do arranjo: os trechos na ordem em que a música
 * acontece. Fica na versão, então é mapeado uma vez e vale para todos
 * os cultos que usarem essa versão.
 */
export function SectionEditor({
  songId,
  versionId,
  sections,
  bpm,
}: SectionEditorProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [measures, setMeasures] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function handleAdd(sectionName?: string) {
    const finalName = (sectionName ?? name).trim();
    if (!finalName) {
      toast.error("Dê um nome ao trecho.");
      return;
    }
    setBusy(true);
    const result = await addSectionAction(songId, versionId, {
      name: finalName,
      measures,
      notes,
    });
    setBusy(false);
    if (result.ok) {
      setName("");
      setMeasures("");
      setNotes("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleRemove(sectionId: string) {
    const result = await removeSectionAction(songId, sectionId);
    if (result.ok) router.refresh();
    else toast.error(result.error);
  }

  async function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= sections.length) return;
    const ids = sections.map((s) => s.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const result = await reorderSectionsAction(songId, versionId, ids);
    if (result.ok) router.refresh();
    else toast.error(result.error);
  }

  return (
    <div className="rounded-xl border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <ListTree className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium uppercase text-muted-foreground">
          Estrutura
        </span>
        {sections.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            {sections.length} trecho{sections.length === 1 ? "" : "s"}
          </span>
        ) : null}
        <ChevronDown
          className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="space-y-3 border-t px-3 py-3">
          {sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Monte a sequência do arranjo — assim a equipe inteira sabe
              quantas vezes repete cada trecho.
            </p>
          ) : (
            <ol className="space-y-1">
              {sections.map((section, index) => (
                <li
                  key={section.id}
                  className="flex items-center gap-2 rounded-lg border px-2 py-1.5"
                >
                  <span className="w-5 text-right font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{section.name}</span>
                  {section.measures ? (
                    <span className="font-mono text-xs text-muted-foreground">
                      {section.measures} comp.
                    </span>
                  ) : null}
                  {section.notes ? (
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                      {section.notes}
                    </span>
                  ) : (
                    <span className="flex-1" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Mover ${section.name} para cima`}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === sections.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Mover ${section.name} para baixo`}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-danger"
                    onClick={() => handleRemove(section.id)}
                    aria-label={`Remover ${section.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ol>
          )}

          {/* Atalhos para os trechos mais comuns */}
          <div className="flex flex-wrap gap-1.5">
            {sectionSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={busy}
                onClick={() => handleAdd(suggestion)}
              >
                <Plus className="h-3 w-3" /> {suggestion}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Outro trecho"
              className="h-8 w-36 text-sm"
            />
            <Input
              value={measures}
              onChange={(e) => setMeasures(e.target.value.replace(/\D/g, ""))}
              placeholder="compassos"
              inputMode="numeric"
              className="h-8 w-24 font-mono text-sm"
            />
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="observação (ex.: 2x)"
              className="h-8 flex-1 text-sm"
            />
            <Button size="sm" disabled={busy} onClick={() => handleAdd()}>
              {busy ? <Loader2 className="animate-spin" /> : <Plus />}
              Adicionar
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Os compassos são opcionais, mas com eles (e o BPM) o app estima
            em que minuto cada trecho começa.
          </p>

          {sections.length > 0 ? (
            <div className="border-t pt-3">
              <StructureTimeline sections={sections} bpm={bpm} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
