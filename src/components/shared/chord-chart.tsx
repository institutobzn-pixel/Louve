"use client";

import * as React from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toDisplayLines, transposeChart, transposeKey } from "@/lib/chords";

interface ChordChartProps {
  /** Cifra digitada pela igreja (acordes acima da letra ou ChordPro). */
  text: string;
  /** Tom em que a cifra foi escrita, para mostrar o tom atual. */
  originalKey?: string | null;
  className?: string;
}

/**
 * Cifra com transposição na hora. O músico sobe ou desce o tom e os
 * acordes acompanham, sem mexer no que está salvo.
 */
export function ChordChart({ text, originalKey, className }: ChordChartProps) {
  const [semitones, setSemitones] = React.useState(0);

  // Acima de 6 semitons, bemol lê melhor que sustenido (Db em vez de C#).
  const preferFlats = semitones > 6 || semitones < -6;

  const lines = React.useMemo(
    () => toDisplayLines(transposeChart(text, semitones, preferFlats)),
    [text, semitones, preferFlats]
  );

  const currentKey = transposeKey(originalKey, semitones, preferFlats);
  const shift = (delta: number) =>
    setSemitones((v) => Math.max(-11, Math.min(11, v + delta)));

  return (
    <div className={cn("rounded-xl border", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          Cifra
        </span>

        {currentKey ? (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-medium text-primary">
            {currentKey}
          </span>
        ) : null}

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => shift(-1)}
            aria-label="Descer meio tom"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[3.25rem] text-center font-mono text-xs tabular-nums text-muted-foreground">
            {semitones > 0 ? `+${semitones}` : semitones}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => shift(1)}
            aria-label="Subir meio tom"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          {semitones !== 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSemitones(0)}
              aria-label="Voltar ao tom original"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Fonte monoespaçada mantém o acorde sobre a sílaba certa. */}
      <div className="overflow-x-auto p-3">
        <pre className="font-mono text-[13px] leading-relaxed">
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                line.kind === "chord" && "font-semibold text-primary",
                line.kind === "blank" && "h-3"
              )}
            >
              {line.text || " "}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
