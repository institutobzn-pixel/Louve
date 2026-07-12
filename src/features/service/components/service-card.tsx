import Link from "next/link";
import { CheckCircle2, Clock, Mic2, User } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  formatDayOfMonth,
  formatWeekday,
} from "@/lib/format";
import type { ServiceListItem } from "@/server/services/service";
import { ServiceStatusPill } from "./service-status-pill";

export function ServiceCard({ service }: { service: ServiceListItem }) {
  const date = new Date(service.date);
  const checklistDone =
    service.checklist?.items.filter((i) => i.isDone).length ?? 0;
  const checklistTotal = service.checklist?.items.length ?? 0;

  return (
    <Link href={`/planejamento/${service.id}`} className="block">
      <Card className="flex items-center gap-4 p-4 transition-colors hover:border-primary/40 hover:bg-muted/40 animate-fade-in-up">
        {/* Bloco de data */}
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-accent">
          <span className="text-[11px] font-medium uppercase text-accent-foreground/70">
            {formatWeekday(date)}
          </span>
          <span className="text-xl font-semibold leading-none text-accent-foreground">
            {formatDayOfMonth(date)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">
              {service.type?.name ?? "Culto"}
            </span>
            <ServiceStatusPill status={service.status} />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {service.startTime ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {service.startTime}
              </span>
            ) : null}
            {service.theme ? (
              <span className="truncate">“{service.theme}”</span>
            ) : null}
            {service.worshipLeader ? (
              <span className="inline-flex items-center gap-1">
                <Mic2 className="h-3.5 w-3.5" /> {service.worshipLeader.name}
              </span>
            ) : null}
            {service.pastor ? (
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> {service.pastor}
              </span>
            ) : null}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-1.5 text-sm text-muted-foreground sm:flex">
          <CheckCircle2 className="h-4 w-4" />
          {checklistDone}/{checklistTotal}
        </div>
      </Card>
    </Link>
  );
}
