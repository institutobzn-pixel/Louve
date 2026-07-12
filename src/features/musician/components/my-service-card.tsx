import Link from "next/link";
import { Clock, Mic2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDayOfMonth, formatWeekday } from "@/lib/format";

export interface MyServiceCardData {
  assignmentId: string;
  memberId: string;
  serviceId: string;
  date: Date;
  startTime: string | null;
  typeName: string | null;
  theme: string | null;
  leaderName: string | null;
  instrumentName: string;
  /** Escala ainda não visualizada — notificação "Nova escala". */
  isNew: boolean;
}

/** Cartão de culto na visão do músico — usado na Agenda e em Meus Cultos. */
export function MyServiceCard({ data }: { data: MyServiceCardData }) {
  return (
    <Link href={`/musico/cultos/${data.serviceId}`} className="block">
      <Card className="flex items-center gap-4 p-4 transition-colors hover:border-primary/40 hover:bg-muted/40 animate-fade-in-up">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-accent">
          <span className="text-[11px] font-medium uppercase text-accent-foreground/70">
            {formatWeekday(data.date)}
          </span>
          <span className="text-xl font-semibold leading-none text-accent-foreground">
            {formatDayOfMonth(data.date)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">
              {data.typeName ?? "Culto"}
            </span>
            {data.isNew ? (
              <Badge className="gap-1">
                <Sparkles className="h-3 w-3" /> Nova escala
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-primary">{data.instrumentName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {data.startTime ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {data.startTime}
              </span>
            ) : null}
            {data.leaderName ? (
              <span className="inline-flex items-center gap-1">
                <Mic2 className="h-3 w-3" /> {data.leaderName}
              </span>
            ) : null}
            {data.theme ? <span>“{data.theme}”</span> : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
