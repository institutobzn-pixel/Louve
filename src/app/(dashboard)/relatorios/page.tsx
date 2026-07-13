import type { Metadata } from "next";
import { BarChart3, ListMusic, Music2, Repeat2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MostPlayedChart } from "@/features/reports/components/most-played-chart";
import { SaturationPanel } from "@/features/reports/components/saturation-panel";
import { WindowFilter } from "@/features/reports/components/window-filter";
import { getCurrentOrganization } from "@/server/org";
import {
  getMostPlayed,
  getReportTotals,
  getSaturation,
  type ReportWindow,
} from "@/server/services/reports";

export const metadata: Metadata = { title: "Relatórios" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ w?: string }>;
}

export default async function RelatoriosPage({ searchParams }: PageProps) {
  const { w } = await searchParams;
  const window: ReportWindow = w === "12m" ? "12m" : "3m";
  const org = await getCurrentOrganization();

  const [mostPlayed, saturation, totals] = await Promise.all([
    getMostPlayed(org.id, { window }),
    getSaturation(org.id, { window }),
    getReportTotals(org.id, { window }),
  ]);

  const stats = [
    { title: "Execuções", value: totals.executions, icon: Repeat2 },
    { title: "Músicas distintas", value: totals.distinctSongs, icon: Music2 },
    { title: "Cultos concluídos", value: totals.services, icon: ListMusic },
  ];

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Músicas mais cantadas e Índice de Saturação do repertório."
        actions={<WindowFilter current={window} />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="mais-cantadas">
        <TabsList>
          <TabsTrigger value="mais-cantadas">
            <BarChart3 className="h-4 w-4" /> Mais cantadas
          </TabsTrigger>
          <TabsTrigger value="saturacao">
            <Repeat2 className="h-4 w-4" /> Índice de Saturação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mais-cantadas">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Músicas mais cantadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MostPlayedChart
                data={mostPlayed.map((song) => ({
                  name: song.name,
                  count: song.count,
                  level: song.level,
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saturacao">
          <SaturationPanel
            summary={saturation.summary}
            songs={saturation.songs.map((song) => ({
              songId: song.songId,
              name: song.name,
              artist: song.artist,
              count: song.count,
              lastPlayed: song.lastPlayed ? song.lastPlayed.toISOString() : null,
              level: song.level,
            }))}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
