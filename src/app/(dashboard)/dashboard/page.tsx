import type { Metadata } from "next";
import { CalendarRange, Library, ListChecks, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Dashboard" };

const stats = [
  { title: "Próximos cultos", value: "—", icon: CalendarRange },
  { title: "Músicas na biblioteca", value: "—", icon: Library },
  { title: "Membros ativos", value: "—", icon: Users },
  { title: "Pendências", value: "—", icon: ListChecks },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do ministério: próximos cultos, pendências e atalhos."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="animate-fade-in-up">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={1.75}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos cultos</CardTitle>
            <CardDescription>
              Os cultos planejados aparecerão aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={CalendarRange}
              title="Nenhum culto planejado"
              description="O módulo de Planejamento chega na Fase 1."
              className="py-10"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist da semana</CardTitle>
            <CardDescription>
              Pendências dos cultos em planejamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={ListChecks}
              title="Nada pendente"
              description="Quando houver cultos em planejamento, as pendências aparecem aqui."
              className="py-10"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
