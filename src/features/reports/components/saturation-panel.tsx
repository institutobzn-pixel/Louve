import { CircleDot } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/format";
import type { SaturationLevel } from "@/server/services/reports";

interface SaturationSong {
  songId: string;
  name: string;
  artist: string | null;
  count: number;
  lastPlayed: string | null;
  level: SaturationLevel;
}

interface SaturationPanelProps {
  summary: Record<SaturationLevel, number>;
  songs: SaturationSong[];
}

const levelConfig: Record<
  SaturationLevel,
  { label: string; dot: string; text: string; hint: string }
> = {
  VERDE: {
    label: "Verde",
    dot: "bg-success",
    text: "text-success",
    hint: "Pouco cantada — livre para uso",
  },
  AMARELO: {
    label: "Amarelo",
    dot: "bg-warning",
    text: "text-warning",
    hint: "Uso moderado — atenção",
  },
  VERMELHO: {
    label: "Vermelho",
    dot: "bg-danger",
    text: "text-danger",
    hint: "Muito cantada — considere descansar",
  },
};

/**
 * Índice de Saturação: semáforo por música. O estado é sempre acompanhado
 * de rótulo (nunca cor sozinha) — canal de status acessível.
 */
export function SaturationPanel({ summary, songs }: SaturationPanelProps) {
  const levels: SaturationLevel[] = ["VERDE", "AMARELO", "VERMELHO"];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {levels.map((level) => {
          const config = levelConfig[level];
          return (
            <Card key={level}>
              <CardContent className="flex items-center gap-3 py-4">
                <span className={cn("h-3 w-3 rounded-full", config.dot)} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{config.hint}</p>
                </div>
                <span className="text-2xl font-semibold tabular-nums">
                  {summary[level]}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {songs.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {songs.map((song) => {
                const config = levelConfig[song.level];
                return (
                  <li
                    key={song.songId}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <CircleDot className={cn("h-4 w-4 shrink-0", config.text)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {song.name}
                      </p>
                      {song.artist ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {song.artist}
                        </p>
                      ) : null}
                    </div>
                    <span className={cn("text-xs font-medium", config.text)}>
                      {config.label}
                    </span>
                    <span className="w-24 text-right text-xs text-muted-foreground">
                      {song.count}×
                      {song.lastPlayed
                        ? ` · ${formatDateShort(new Date(song.lastPlayed))}`
                        : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
