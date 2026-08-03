import { Music2, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  describeSuggestion,
  midiToLabel,
  suggestKeys,
  type KeySuggestion,
} from "@/lib/vocal-range";

interface KeySuggestionPanelProps {
  singerName: string;
  vocalLow: number | null;
  vocalHigh: number | null;
  melodyLow: number | null;
  melodyHigh: number | null;
  /** Tom em que a versão está cadastrada (ex.: "G"). */
  originalKey?: string | null;
  className?: string;
}

/** Rótulo curto do deslocamento de oitava. */
function octaveLabel(shift: number) {
  if (shift === 0) return null;
  const count = Math.abs(shift);
  const word = count === 1 ? "oitava" : "oitavas";
  return `${count} ${word} ${shift < 0 ? "abaixo" : "acima"}`;
}

function SuggestionRow({
  suggestion,
  highlight,
}: {
  suggestion: KeySuggestion;
  highlight?: boolean;
}) {
  const octave = octaveLabel(suggestion.octaveShift);
  return (
    <li
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-lg px-2 py-1.5",
        highlight && "bg-success/10"
      )}
    >
      <span
        className={cn(
          "font-mono text-sm font-semibold",
          highlight ? "text-success" : "text-foreground"
        )}
      >
        {suggestion.keyName ??
          `${suggestion.semitones >= 0 ? "+" : ""}${suggestion.semitones}`}
      </span>
      {octave ? (
        <span className="text-xs text-muted-foreground">{octave}</span>
      ) : null}
      <span className="font-mono text-xs text-muted-foreground">
        {midiToLabel(suggestion.lowNote)}–{midiToLabel(suggestion.highNote)}
      </span>
      {suggestion.aboveCongregation && suggestion.fits ? (
        <span className="inline-flex items-center gap-1 text-xs text-warning">
          <TriangleAlert className="h-3 w-3" />
          alto para a congregação
        </span>
      ) : null}
    </li>
  );
}

/**
 * Diz em que tom a música fica boa para um cantor específico, comparando
 * a extensão da melodia com a extensão vocal cadastrada. O cantor não
 * precisa saber teoria: ele lê o nome do tom e pronto.
 */
export function KeySuggestionPanel({
  singerName,
  vocalLow,
  vocalHigh,
  melodyLow,
  melodyHigh,
  originalKey,
  className,
}: KeySuggestionPanelProps) {
  const missingVoice = vocalLow === null || vocalHigh === null;
  const missingMelody = melodyLow === null || melodyHigh === null;

  if (missingVoice || missingMelody) {
    return (
      <div className={cn("rounded-xl border bg-muted/30 p-3", className)}>
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Tom para {singerName}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {missingVoice && missingMelody
            ? "Falta cadastrar a extensão vocal do cantor e a extensão da melodia desta versão."
            : missingVoice
              ? `Falta cadastrar a extensão vocal de ${singerName}, em Equipe.`
              : "Falta cadastrar a extensão da melodia desta versão, na Biblioteca."}
        </p>
      </div>
    );
  }

  const suggestions = suggestKeys({
    melodyLow,
    melodyHigh,
    vocalLow,
    vocalHigh,
    originalKey,
  });

  const best = suggestions[0];
  const alternatives = suggestions.slice(1, 4).filter((s) => s.fits);

  return (
    <div className={cn("rounded-xl border bg-muted/30 p-3", className)}>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
        <Music2 className="h-3.5 w-3.5" /> Tom para {singerName}
      </p>

      {best.fits ? (
        <>
          <p className="mt-1.5 flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-success">
              {best.keyName ??
                `${best.semitones >= 0 ? "+" : ""}${best.semitones}`}
            </span>
            {octaveLabel(best.octaveShift) ? (
              <span className="text-sm text-muted-foreground">
                {octaveLabel(best.octaveShift)}
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {describeSuggestion(best)}
          </p>

          {alternatives.length > 0 ? (
            <>
              <p className="mt-2.5 text-xs text-muted-foreground">
                Também servem:
              </p>
              <ul className="mt-0.5 space-y-0.5">
                {alternatives.map((s) => (
                  <SuggestionRow key={s.semitones} suggestion={s} />
                ))}
              </ul>
            </>
          ) : null}
        </>
      ) : (
        <>
          <p className="mt-1.5 text-sm">
            Nenhum tom acomoda a melodia inteira na extensão de {singerName}.
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Mais próximo:{" "}
            <span className="font-mono text-foreground">
              {best.keyName ??
                `${best.semitones >= 0 ? "+" : ""}${best.semitones}`}
            </span>{" "}
            — {describeSuggestion(best)}
          </p>
        </>
      )}
    </div>
  );
}
