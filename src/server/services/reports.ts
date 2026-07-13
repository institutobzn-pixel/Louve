import { prisma } from "@/server/db";

/**
 * Relatórios (docs/04 · Fase 8): músicas mais cantadas e Índice de
 * Saturação (semáforo). Fonte de verdade: song_executions, registradas
 * ao concluir um culto.
 */

export type ReportWindow = "3m" | "12m";

export interface ReportFilters {
  window: ReportWindow;
  typeId?: string;
  campusId?: string;
}

function windowStart(window: ReportWindow): Date {
  const start = new Date();
  start.setMonth(start.getMonth() - (window === "3m" ? 3 : 12));
  return start;
}

export type SaturationLevel = "VERDE" | "AMARELO" | "VERMELHO";

/** Faixas do semáforo por janela (quantidade de execuções). */
const saturationThresholds: Record<
  ReportWindow,
  { amarelo: number; vermelho: number }
> = {
  "3m": { amarelo: 2, vermelho: 4 },
  "12m": { amarelo: 5, vermelho: 9 },
};

export function saturationLevel(
  count: number,
  window: ReportWindow
): SaturationLevel {
  const t = saturationThresholds[window];
  if (count >= t.vermelho) return "VERMELHO";
  if (count >= t.amarelo) return "AMARELO";
  return "VERDE";
}

interface SongStat {
  songId: string;
  name: string;
  artist: string | null;
  count: number;
  lastPlayed: Date | null;
  level: SaturationLevel;
}

/** Agrega execuções por música na janela, aplicando os filtros. */
async function aggregate(
  organizationId: string,
  filters: ReportFilters
): Promise<SongStat[]> {
  const executions = await prisma.songExecution.findMany({
    where: {
      organizationId,
      playedAt: { gte: windowStart(filters.window) },
      ...(filters.typeId || filters.campusId
        ? {
            service: {
              ...(filters.typeId ? { typeId: filters.typeId } : {}),
              ...(filters.campusId ? { campusId: filters.campusId } : {}),
            },
          }
        : {}),
    },
    include: { song: true },
    orderBy: { playedAt: "desc" },
  });

  const byS = new Map<string, SongStat>();
  for (const execution of executions) {
    const existing = byS.get(execution.songId);
    if (existing) {
      existing.count += 1;
      if (!existing.lastPlayed || execution.playedAt > existing.lastPlayed) {
        existing.lastPlayed = execution.playedAt;
      }
    } else {
      byS.set(execution.songId, {
        songId: execution.songId,
        name: execution.song.name,
        artist: execution.song.artist,
        count: 1,
        lastPlayed: execution.playedAt,
        level: "VERDE",
      });
    }
  }

  const stats = Array.from(byS.values());
  for (const stat of stats) {
    stat.level = saturationLevel(stat.count, filters.window);
  }
  return stats;
}

export async function getMostPlayed(
  organizationId: string,
  filters: ReportFilters,
  limit = 12
) {
  const stats = await aggregate(organizationId, filters);
  return stats.sort((a, b) => b.count - a.count).slice(0, limit);
}

export async function getSaturation(
  organizationId: string,
  filters: ReportFilters
) {
  const stats = await aggregate(organizationId, filters);
  const summary = { VERDE: 0, AMARELO: 0, VERMELHO: 0 };
  for (const stat of stats) summary[stat.level] += 1;
  // Mais saturadas primeiro (foco de atenção).
  const ranked = stats.sort((a, b) => b.count - a.count);
  return { summary, songs: ranked };
}

export async function getReportTotals(
  organizationId: string,
  filters: ReportFilters
) {
  const start = windowStart(filters.window);
  const [executions, distinctSongs, services] = await Promise.all([
    prisma.songExecution.count({
      where: { organizationId, playedAt: { gte: start } },
    }),
    prisma.songExecution
      .findMany({
        where: { organizationId, playedAt: { gte: start } },
        distinct: ["songId"],
        select: { songId: true },
      })
      .then((rows) => rows.length),
    prisma.service.count({
      where: {
        organizationId,
        status: "CONCLUIDO",
        date: { gte: start },
      },
    }),
  ]);
  return { executions, distinctSongs, services };
}

export type MostPlayedRow = Awaited<ReturnType<typeof getMostPlayed>>[number];
