import type { Prisma, ServiceStatus } from "@prisma/client";

import { prisma } from "@/server/db";
import { defaultChecklistItems } from "@/config/defaults";

/**
 * Regras de negócio do Culto (docs/04 e 08).
 * Todo culto nasce com setlist único e checklist padrão.
 */

export interface ServiceInfoInput {
  date: Date;
  startTime?: string | null;
  typeId?: string | null;
  campusId?: string | null;
  theme?: string | null;
  pastor?: string | null;
  worshipLeaderId?: string | null;
  notes?: string | null;
}

export async function createService(
  organizationId: string,
  input: ServiceInfoInput
) {
  return prisma.service.create({
    data: {
      organizationId,
      ...input,
      setlist: { create: {} },
      checklist: {
        create: {
          items: {
            create: defaultChecklistItems.map((label) => ({ label })),
          },
        },
      },
    },
  });
}

export async function updateServiceInfo(
  organizationId: string,
  serviceId: string,
  input: ServiceInfoInput
) {
  return prisma.service.update({
    // organizationId no where garante o isolamento de tenant também aqui.
    where: { id: serviceId, organizationId },
    data: input,
  });
}

export async function updateServiceStatus(
  organizationId: string,
  serviceId: string,
  status: ServiceStatus
) {
  // Concluir o culto registra a execução de cada música do setlist
  // (fonte dos relatórios). Idempotente: recria as execuções do culto.
  if (status === "CONCLUIDO") {
    const service = await prisma.service.findUniqueOrThrow({
      where: { id: serviceId, organizationId },
      include: { setlist: { include: { items: true } } },
    });
    const items = service.setlist?.items ?? [];
    await prisma.$transaction([
      prisma.songExecution.deleteMany({ where: { serviceId } }),
      prisma.songExecution.createMany({
        data: items.map((item) => ({
          organizationId,
          songId: item.songId,
          serviceId,
          playedAt: service.date,
        })),
      }),
      prisma.service.update({
        where: { id: serviceId, organizationId },
        data: { status },
      }),
    ]);
    return;
  }

  // Sair de "Concluído" remove as execuções registradas para o culto.
  await prisma.songExecution.deleteMany({ where: { serviceId } });
  return prisma.service.update({
    where: { id: serviceId, organizationId },
    data: { status },
  });
}

export async function deleteService(
  organizationId: string,
  serviceId: string
) {
  return prisma.service.delete({
    where: { id: serviceId, organizationId },
  });
}

/**
 * Duplica um culto: copia as informações e cria setlist/checklist zerados.
 * (A cópia de setlist/escala vem nas fases desses módulos.)
 */
export async function duplicateService(
  organizationId: string,
  serviceId: string
) {
  const source = await prisma.service.findUniqueOrThrow({
    where: { id: serviceId, organizationId },
  });

  const nextWeek = new Date(source.date);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return createService(organizationId, {
    date: nextWeek,
    startTime: source.startTime,
    typeId: source.typeId,
    campusId: source.campusId,
    theme: source.theme,
    pastor: source.pastor,
    worshipLeaderId: source.worshipLeaderId,
    notes: source.notes,
  });
}

const serviceListInclude = {
  type: true,
  worshipLeader: true,
  checklist: { include: { items: true } },
} satisfies Prisma.ServiceInclude;

export async function getServices(organizationId: string) {
  return prisma.service.findMany({
    where: { organizationId },
    include: serviceListInclude,
    orderBy: { date: "asc" },
  });
}

export async function getServiceById(
  organizationId: string,
  serviceId: string
) {
  return prisma.service.findUnique({
    where: { id: serviceId, organizationId },
    include: {
      type: true,
      campus: true,
      worshipLeader: true,
      checklist: { include: { items: true } },
      setlist: {
        include: {
          items: {
            include: { song: { include: { versions: true } }, version: true },
            orderBy: { position: "asc" },
          },
        },
      },
      assignments: {
        include: {
          member: { include: { availability: true } },
          instrument: { include: { category: true } },
        },
      },
      notices: { orderBy: { title: "asc" } },
      palette: true,
      stageMap: { include: { positions: true } },
    },
  });
}

export type ServiceWithRelations = NonNullable<
  Awaited<ReturnType<typeof getServiceById>>
>;
export type ServiceListItem = Awaited<
  ReturnType<typeof getServices>
>[number];
