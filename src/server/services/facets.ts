import { prisma } from "@/server/db";

/**
 * Facetas do culto (Fase 6): checklist, avisos, paleta de roupas e
 * mapa de palco. Isolamento de tenant sempre via join com o culto.
 */

/* ---------- Checklist ---------- */

export async function toggleChecklistItem(
  organizationId: string,
  itemId: string,
  isDone: boolean
) {
  await prisma.checklistItem.findFirstOrThrow({
    where: { id: itemId, checklist: { service: { organizationId } } },
  });
  return prisma.checklistItem.update({
    where: { id: itemId },
    data: { isDone },
  });
}

/* ---------- Avisos ---------- */

export async function createNotice(
  organizationId: string,
  serviceId: string,
  input: { title: string; body?: string | null }
) {
  await prisma.service.findFirstOrThrow({
    where: { id: serviceId, organizationId },
  });
  return prisma.notice.create({ data: { serviceId, ...input } });
}

export async function updateNotice(
  organizationId: string,
  noticeId: string,
  input: { title: string; body?: string | null }
) {
  await prisma.notice.findFirstOrThrow({
    where: { id: noticeId, service: { organizationId } },
  });
  return prisma.notice.update({ where: { id: noticeId }, data: input });
}

export async function deleteNotice(organizationId: string, noticeId: string) {
  await prisma.notice.findFirstOrThrow({
    where: { id: noticeId, service: { organizationId } },
  });
  return prisma.notice.delete({ where: { id: noticeId } });
}

/* ---------- Paleta de Roupas ---------- */

export async function upsertPalette(
  organizationId: string,
  serviceId: string,
  input: { colors: string[]; notes?: string | null; referenceUrl?: string | null }
) {
  await prisma.service.findFirstOrThrow({
    where: { id: serviceId, organizationId },
  });
  return prisma.clothingPalette.upsert({
    where: { serviceId },
    update: input,
    create: { serviceId, ...input },
  });
}

/* ---------- Mapa de Palco ---------- */

export interface StagePositionInput {
  id?: string;
  assignmentId?: string | null;
  label?: string | null;
  x: number;
  y: number;
}

/** Substitui o conjunto de posições do palco (salvamento em lote). */
export async function saveStagePositions(
  organizationId: string,
  serviceId: string,
  positions: StagePositionInput[]
) {
  await prisma.service.findFirstOrThrow({
    where: { id: serviceId, organizationId },
  });

  const stageMap = await prisma.stageMap.upsert({
    where: { serviceId },
    update: {},
    create: { serviceId },
  });

  await prisma.$transaction([
    prisma.stagePosition.deleteMany({ where: { stageMapId: stageMap.id } }),
    prisma.stagePosition.createMany({
      data: positions.map((position) => ({
        stageMapId: stageMap.id,
        assignmentId: position.assignmentId ?? null,
        label: position.label ?? null,
        x: position.x,
        y: position.y,
      })),
    }),
  ]);

  return stageMap;
}
