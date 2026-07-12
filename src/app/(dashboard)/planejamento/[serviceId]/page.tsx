import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Mic2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ServiceActionsMenu } from "@/features/service/components/service-actions-menu";
import { ServiceInfoForm } from "@/features/service/components/service-info-form";
import { ServiceStatusPill } from "@/features/service/components/service-status-pill";
import { ServiceTabs } from "@/features/service/components/service-tabs";
import { SetlistBoard } from "@/features/setlist/components/setlist-board";
import { ScheduleBoard } from "@/features/schedule/components/schedule-board";
import { getInstrumentOptions } from "@/features/team/queries";
import {
  getServiceDetail,
  getServiceFormOptions,
} from "@/features/service/queries";
import { formatDateLong, toDateInputValue } from "@/lib/format";

export const metadata: Metadata = { title: "Culto" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ serviceId: string }>;
}

export default async function CultoPage({ params }: PageProps) {
  const { serviceId } = await params;

  const [service, options, instrumentCategories] = await Promise.all([
    getServiceDetail(serviceId),
    getServiceFormOptions(),
    getInstrumentOptions(),
  ]);

  if (!service) notFound();

  const date = new Date(service.date);

  return (
    <>
      {/* Cabeçalho do culto */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
          <Link href="/planejamento">
            <ArrowLeft /> Planejamento
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold capitalize tracking-tight">
                {service.type?.name ?? "Culto"}
              </h1>
              <ServiceStatusPill status={service.status} />
            </div>
            <p className="mt-1 capitalize text-muted-foreground">
              {formatDateLong(date)}
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
          </div>

          <ServiceActionsMenu serviceId={service.id} status={service.status} />
        </div>
      </div>

      <ServiceTabs
        checklistItems={service.checklist?.items ?? []}
        rehearsalHref={`/musico/ensaio/${service.id}`}
        scheduleContent={
          <ScheduleBoard
            serviceId={service.id}
            categories={instrumentCategories}
            assignments={service.assignments.map((assignment) => ({
              id: assignment.id,
              memberId: assignment.memberId,
              memberName: assignment.member?.name ?? null,
              instrumentId: assignment.instrumentId,
              instrumentName: assignment.instrument.name,
              categoryKey: assignment.instrument.category.key,
              status: assignment.status,
              isLeader: assignment.isLeader,
            }))}
          />
        }
        setlistContent={
          service.setlist ? (
            <SetlistBoard
              serviceId={service.id}
              setlistId={service.setlist.id}
              items={service.setlist.items.map((item) => ({
                id: item.id,
                keyOverride: item.keyOverride,
                bpmOverride: item.bpmOverride,
                durationSec: item.durationSec,
                notes: item.notes,
                versionId: item.versionId,
                versionLabel: item.version?.label ?? null,
                song: {
                  id: item.song.id,
                  name: item.song.name,
                  artist: item.song.artist,
                  versions: item.song.versions.map((v) => ({
                    id: v.id,
                    label: v.label,
                  })),
                },
              }))}
            />
          ) : null
        }
        infoContent={
          <ServiceInfoForm
            serviceId={service.id}
            typeOptions={options.types}
            memberOptions={options.members}
            defaultValues={{
              date: toDateInputValue(date),
              startTime: service.startTime ?? "",
              typeId: service.typeId ?? "",
              theme: service.theme ?? "",
              pastor: service.pastor ?? "",
              worshipLeaderId: service.worshipLeaderId ?? "",
              notes: service.notes ?? "",
            }}
          />
        }
      />
    </>
  );
}
