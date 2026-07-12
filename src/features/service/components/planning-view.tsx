"use client";

import * as React from "react";
import { CalendarDays, CalendarRange, List } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMonthYear } from "@/lib/format";
import type { ServiceListItem } from "@/server/services/service";
import { ServiceCard } from "./service-card";
import { ServiceCalendar } from "./service-calendar";

interface PlanningViewProps {
  services: ServiceListItem[];
  createButton: React.ReactNode;
}

/** Lista de cultos agrupada por mês + visão de calendário. */
export function PlanningView({ services, createButton }: PlanningViewProps) {
  const groups = React.useMemo(() => {
    const map = new Map<string, ServiceListItem[]>();
    for (const service of services) {
      const key = formatMonthYear(new Date(service.date));
      const list = map.get(key) ?? [];
      list.push(service);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [services]);

  if (services.length === 0) {
    return (
      <EmptyState
        icon={CalendarRange}
        title="Nenhum culto planejado ainda"
        description='Comece pelo botão "Planejar culto" — informações básicas primeiro, depois setlist, escala e todo o resto.'
        action={createButton}
      />
    );
  }

  return (
    <Tabs defaultValue="lista">
      <TabsList>
        <TabsTrigger value="lista">
          <List className="h-4 w-4" /> Lista
        </TabsTrigger>
        <TabsTrigger value="calendario">
          <CalendarDays className="h-4 w-4" /> Calendário
        </TabsTrigger>
      </TabsList>

      <TabsContent value="lista" className="space-y-6">
        {groups.map(([month, items]) => (
          <section key={month}>
            <h2 className="mb-3 text-sm font-medium capitalize text-muted-foreground">
              {month}
            </h2>
            <div className="space-y-2">
              {items.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        ))}
      </TabsContent>

      <TabsContent value="calendario">
        <ServiceCalendar
          services={services.map((s) => ({
            id: s.id,
            date: new Date(s.date).toISOString(),
            title: `${s.startTime ? s.startTime + " · " : ""}${s.type?.name ?? "Culto"}`,
          }))}
        />
      </TabsContent>
    </Tabs>
  );
}
