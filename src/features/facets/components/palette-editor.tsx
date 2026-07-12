"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { savePaletteAction } from "../actions";

export interface PaletteView {
  colors: string[];
  notes: string | null;
  referenceUrl: string | null;
}

interface PaletteEditorProps {
  serviceId: string;
  palette: PaletteView | null;
}

/** Paleta de roupas do culto: cores, observações e referência visual. */
export function PaletteEditor({ serviceId, palette }: PaletteEditorProps) {
  const router = useRouter();
  const [colors, setColors] = React.useState<string[]>(palette?.colors ?? []);
  const [pickerValue, setPickerValue] = React.useState("#7c3aed");
  const [notes, setNotes] = React.useState(palette?.notes ?? "");
  const [referenceUrl, setReferenceUrl] = React.useState(
    palette?.referenceUrl ?? ""
  );
  const [saving, setSaving] = React.useState(false);

  function addColor() {
    if (colors.length >= 8) {
      toast.error("Máximo de 8 cores na paleta.");
      return;
    }
    if (colors.includes(pickerValue)) return;
    setColors([...colors, pickerValue]);
  }

  async function handleSave() {
    setSaving(true);
    const result = await savePaletteAction(serviceId, {
      colors,
      notes,
      referenceUrl,
    });
    setSaving(false);
    if (result.ok) {
      toast.success("Paleta salva — visível para todos os escalados.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div className="space-y-2">
          <Label>Cores do culto</Label>
          {colors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma cor definida ainda.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <div key={color} className="group relative">
                  <div
                    className="h-14 w-14 rounded-xl border shadow-sm"
                    style={{ backgroundColor: color }}
                    aria-label={`Cor ${color}`}
                  />
                  <button
                    type="button"
                    aria-label={`Remover cor ${color}`}
                    onClick={() =>
                      setColors(colors.filter((c) => c !== color))
                    }
                    className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-danger text-danger-foreground shadow group-hover:flex"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <p className="mt-1 text-center font-mono text-[10px] text-muted-foreground">
                    {color}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="color"
              value={pickerValue}
              onChange={(e) => setPickerValue(e.target.value)}
              aria-label="Escolher cor"
              className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
            />
            <Button variant="outline" size="sm" onClick={addColor}>
              <Plus /> Adicionar cor
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-notes">Observações</Label>
          <Textarea
            id="p-notes"
            rows={3}
            placeholder="Ex.: tons neutros, evitar estampas; detalhes em violeta."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-ref">Referência visual (URL)</Label>
          <Input
            id="p-ref"
            type="url"
            placeholder="https://…"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            Salvar paleta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
