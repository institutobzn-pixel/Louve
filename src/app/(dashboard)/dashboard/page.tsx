import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRange, GitBranch, Library, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ServiceCard } from "@/features/service/components/service-card";
import { getDashboardData } from "@/features/dashboard/queries";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { stats, upcoming } = await getDashboardData();

  const tiles = [
    {
      title: "Próximos cultos",
      value: stats.upcomingCount,
      icon: CalendarRange,
      href: "/planejamento",
    },
    {
      title: "Músicas na biblioteca",
      value: stats.libraryCount,
      icon: Library,
      href: "/biblioteca",
    },
    {
      title: "Membros ativos",
      value: stats.membersCount,
      icon: Users,
      href: "/equipe",
    },
    {
      title: "Em implantação",
      value: stats.implementationCount,
      icon: GitBranch,
      href: "/implantacao",
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do ministério: próximos cultos e atalhos."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.title} href={tile.href}>
            <Card className="transition-colors hover:border-primary/40 animate-fade-in-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {tile.title}
                </CardTitle>
                <tile.icon
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.75}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {tile.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximos cultos</CardTitle>
            <CardDescription>
              Os próximos cultos planejados do ministério.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarRange}
                title="Nenhum culto planejado"
                description="Comece planejando um culto no módulo Planejamento."
                className="py-10"
              />
            ) : (
              <div className="space-y-2">
                {upcoming.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
