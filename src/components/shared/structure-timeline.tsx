import { cn } from "@/lib/utils";

export interface SectionView {
  id: string;
  name: string;
  measures: number | null;
  notes: string | null;
}

/** Compassos por minuto a partir do BPM, assumindo 4/4. */
const BEATS_PER_MEASURE = 4;

/** Duração estimada de um trecho, em segundos (4/4). */
function sectionSeconds(measures: number, bpm: number) {
  return (measures * BEATS_PER_MEASURE * 60) / bpm;
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Estrutura do arranjo em linha do tempo. A largura de cada trecho segue
 * o número de compassos, então dá para ver de relance onde a música
 * passa mais tempo. Com o BPM cadastrado, mostra também em que minuto
 * cada trecho começa.
 */
export function StructureTimeline({
  sections,
  bpm,
  className,
}: {
  sections: SectionView[];
  bpm?: number | null;
  className?: string;
}) {
  if (sections.length === 0) return null;

  const totalMeasures = sections.reduce((sum, s) => sum + (s.measures ?? 0), 0);
  // Sem compassos informados, os trechos dividem a barra igualmente.
  const useMeasures = totalMeasures > 0;

  let elapsed = 0;
  const rows = sections.map((section) => {
    const measures = section.measures ?? 0;
    const startsAt = elapsed;
    if (bpm && measures) elapsed += sectionSeconds(measures, bpm);
    return {
      ...section,
      startsAt,
      width: useMeasures
        ? ((measures || 0) / totalMeasures) * 100
        : 100 / sections.length,
    };
  });

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Estrutura
        </p>
        <p className="text-xs text-muted-foreground">
          {useMeasures ? `${totalMeasures} compassos` : null}
          {useMeasures && bpm ? " · " : null}
          {bpm && useMeasures ? formatClock(elapsed) : null}
        </p>
      </div>

      {/* Barra proporcional aos compassos */}
      {useMeasures ? (
        <div className="flex h-2 overflow-hidden rounded-full bg-muted">
          {rows.map((row, i) => (
            <div
              key={row.id}
              className={cn(
                "h-full border-r border-background last:border-r-0",
                i % 2 === 0 ? "bg-primary/70" : "bg-primary/40"
              )}
              style={{ width: `${row.width}%` }}
              title={`${row.name}${row.measures ? ` · ${row.measures} compassos` : ""}`}
            />
          ))}
        </div>
      ) : null}

      <ol className="space-y-1">
        {rows.map((row, i) => (
          <li
            key={row.id}
            className="flex items-baseline gap-2 text-sm leading-snug"
          >
            <span className="w-5 shrink-0 text-right font-mono text-xs text-muted-foreground">
              {i + 1}
            </span>
            <span className="font-medium">{row.name}</span>
            {row.measures ? (
              <span className="font-mono text-xs text-muted-foreground">
                {row.measures} comp.
              </span>
            ) : null}
            {bpm && row.measures ? (
              <span className="font-mono text-xs text-muted-foreground/70">
                {formatClock(row.startsAt)}
              </span>
            ) : null}
            {row.notes ? (
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {row.notes}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
