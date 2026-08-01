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
import { ChecklistPanel } from "@/features/facets/components/checklist-panel";
import { NoticesPanel } from "@/features/facets/components/notices-panel";
import { PaletteEditor } from "@/features/facets/components/palette-editor";
import { StageMapEditor } from "@/features/facets/components/stage-map-editor";
import { buildChecklist } from "@/features/facets/checklist";
import { getInstrumentOptions } from "@/features/team/queries";
import { findBlockingAvailability } from "@/server/services/availability-check";
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

  const activeAssignments = service.assignments.filter(
    (assignment) => assignment.status !== "SUBSTITUIDO"
  );

  const checklistItems = buildChecklist({
    items: service.checklist?.items ?? [],
    setlistCount: service.setlist?.items.length ?? 0,
    scheduledCount: activeAssignments.length,
    seenCount: activeAssignments.filter((a) => a.seenAt !== null).length,
    hasPalette: Boolean(service.palette && service.palette.colors),
    stagePinCount: service.stageMap?.positions.length ?? 0,
  });

  // Opções e pinos do mapa de palco.
  const stageAssignmentOptions = activeAssignments
    .filter((a) => a.member)
    .map((a) => ({
      assignmentId: a.id,
      memberName: a.member!.name,
      instrumentName: a.instrument.name,
    }));

  const initialPins = (service.stageMap?.positions ?? []).map((position) => {
    const assignment = position.assignmentId
      ? activeAssignments.find((a) => a.id === position.assignmentId)
      : undefined;
    return {
      key: position.id,
      assignmentId: position.assignmentId,
      label: assignment?.member?.name ?? position.label ?? "Sem nome",
      sublabel: assignment?.instrument.name ?? null,
      x: position.x,
      y: position.y,
    };
  });

  const paletteColors = Array.isArray(service.palette?.colors)
    ? (service.palette.colors as string[])
    : [];

  return (
    <>
      {/* Cabeçalho do culto */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
          <Link href="/planejamento">
            <ArrowLeft /> Escalas
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
        rehearsalHref={`/musico/ensaio/${service.id}`}
        checklistContent={
          <ChecklistPanel serviceId={service.id} items={checklistItems} />
        }
        noticesContent={
          <NoticesPanel
            serviceId={service.id}
            notices={service.notices.map((notice) => ({
              id: notice.id,
              title: notice.title,
              body: notice.body,
            }))}
          />
        }
        paletteContent={
          <PaletteEditor
            serviceId={service.id}
            palette={{
              colors: paletteColors,
              notes: service.palette?.notes ?? null,
              referenceUrl: service.palette?.referenceUrl ?? null,
            }}
          />
        }
        stageMapContent={
          <StageMapEditor
            serviceId={service.id}
            initialPins={initialPins}
            assignments={stageAssignmentOptions}
          />
        }
        scheduleContent={
          <ScheduleBoard
            serviceId={service.id}
            categories={instrumentCategories}
            assignments={service.assignments
              .filter((assignment) => assignment.status !== "SUBSTITUIDO")
              .map((assignment) => {
                const blocking = assignment.member
                  ? findBlockingAvailability(
                      assignment.member.availability,
                      new Date(service.date)
                    )
                  : undefined;
                return {
                  id: assignment.id,
                  memberId: assignment.memberId,
                  memberName: assignment.member?.name ?? null,
                  instrumentId: assignment.instrumentId,
                  instrumentName: assignment.instrument.name,
                  categoryKey: assignment.instrument.category.key,
                  isLeader: assignment.isLeader,
                  seen: assignment.seenAt !== null,
                  unavailableReason: blocking
                    ? (blocking.reason ?? "Indisponível")
                    : null,
                };
              })}
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
              worshipLeaderId: service.worshipLeaderId ?? "",
              notes: service.notes ?? "",
            }}
          />
        }
      />
    </>
  );
}
