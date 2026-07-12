import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Megaphone,
  Mic2,
  Music4,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PresenceButtons } from "@/features/musician/components/presence-buttons";
import { assignmentStatusConfig } from "@/features/schedule/types";
import { formatDateLong, formatDuration } from "@/lib/format";
import { getCurrentMember } from "@/server/member-context";
import { getCurrentOrganization } from "@/server/org";
import { getMyServiceDetail } from "@/server/services/musician";

export const metadata: Metadata = { title: "Meu Culto" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ serviceId: string }>;
}

export default async function MeuCultoPage({ params }: PageProps) {
  const { serviceId } = await params;
  const org = await getCurrentOrganization();
  const member = await getCurrentMember();
  if (!member) notFound();

  const assignment = await getMyServiceDetail(org.id, member.id, serviceId);
  if (!assignment) notFound();

  const service = assignment.service;
  const status = assignmentStatusConfig[assignment.status];
  const setlistItems = service.setlist?.items ?? [];

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href="/musico">
          <ArrowLeft /> Minha Agenda
        </Link>
      </Button>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {service.type?.name ?? "Culto"}
          </h1>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <p className="mt-1 capitalize text-muted-foreground">
          {formatDateLong(new Date(service.date))}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {service.startTime ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {service.startTime}
            </span>
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
        {service.theme ? (
          <p className="mt-2 text-sm">
            Tema: <span className="font-medium">“{service.theme}”</span>
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Minha Escala</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              Você está escalado(a) como{" "}
              <span className="font-medium text-primary">
                {assignment.instrument.name}
              </span>{" "}
              ({assignment.instrument.category.label}).
            </p>
            {assignment.status === "CONVIDADO" ? (
              <PresenceButtons
                memberId={member.id}
                assignmentId={assignment.id}
              />
            ) : null}
            <Button asChild>
              <Link href={`/musico/ensaio/${service.id}`}>
                <Music4 /> Abrir Modo Ensaio
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Setlist</CardTitle>
          </CardHeader>
          <CardContent>
            {setlistItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                O repertório ainda não foi definido.
              </p>
            ) : (
              <ol className="space-y-2">
                {setlistItems.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border p-3 text-sm"
                  >
                    <span className="w-5 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {item.song.name}
                      </span>
                      {item.song.artist ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.song.artist}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex shrink-0 gap-1.5">
                      {item.keyOverride ? (
                        <Badge variant="outline" className="font-mono">
                          {item.keyOverride}
                        </Badge>
                      ) : null}
                      {item.durationSec ? (
                        <Badge variant="outline" className="font-mono">
                          {formatDuration(item.durationSec)}
                        </Badge>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-4 w-4" /> Avisos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {service.notices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum aviso para este culto.
              </p>
            ) : (
              <ul className="space-y-2">
                {service.notices.map((notice) => (
                  <li key={notice.id} className="rounded-xl border p-3 text-sm">
                    <p className="font-medium">{notice.title}</p>
                    {notice.body ? (
                      <p className="mt-1 text-muted-foreground">
                        {notice.body}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
