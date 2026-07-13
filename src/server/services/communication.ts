import type { RoleKey } from "@prisma/client";

import { prisma } from "@/server/db";

/**
 * Comunicação (docs/06 · Fase 9): avisos gerais do ministério, segmentados
 * por papel. Diferente dos avisos de um culto — estes valem para a equipe.
 */

export interface AnnouncementInput {
  title: string;
  body?: string | null;
  /** Papéis-alvo; vazio = todos. */
  audience: RoleKey[];
}

export async function createAnnouncement(
  organizationId: string,
  input: AnnouncementInput,
  publish: boolean
) {
  return prisma.announcement.create({
    data: {
      organizationId,
      title: input.title,
      body: input.body ?? null,
      audience: input.audience,
      publishedAt: publish ? new Date() : null,
    },
  });
}

export async function updateAnnouncement(
  organizationId: string,
  announcementId: string,
  input: AnnouncementInput
) {
  await prisma.announcement.findFirstOrThrow({
    where: { id: announcementId, organizationId },
  });
  return prisma.announcement.update({
    where: { id: announcementId },
    data: {
      title: input.title,
      body: input.body ?? null,
      audience: input.audience,
    },
  });
}

export async function setAnnouncementPublished(
  organizationId: string,
  announcementId: string,
  publish: boolean
) {
  await prisma.announcement.findFirstOrThrow({
    where: { id: announcementId, organizationId },
  });
  return prisma.announcement.update({
    where: { id: announcementId },
    data: { publishedAt: publish ? new Date() : null },
  });
}

export async function deleteAnnouncement(
  organizationId: string,
  announcementId: string
) {
  await prisma.announcement.findFirstOrThrow({
    where: { id: announcementId, organizationId },
  });
  return prisma.announcement.delete({ where: { id: announcementId } });
}

export async function getAnnouncements(organizationId: string) {
  return prisma.announcement.findMany({
    where: { organizationId },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
  });
}

/** Avisos publicados visíveis a um papel (App do Músico). */
export async function getPublishedForRole(
  organizationId: string,
  role: RoleKey
) {
  const announcements = await prisma.announcement.findMany({
    where: { organizationId, publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
  });
  return announcements.filter((a) => {
    const audience = (a.audience as RoleKey[]) ?? [];
    return audience.length === 0 || audience.includes(role);
  });
}

export type AnnouncementRow = Awaited<
  ReturnType<typeof getAnnouncements>
>[number];
