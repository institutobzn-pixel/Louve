import type { AssignmentStatus } from "@prisma/client";

import { prisma } from "@/server/db";

/**
 * Regras de negócio da Escala (docs/04 e 08 · Fase 4).
 * Assignments pertencem a um culto e a um instrumento/função; o motor de
 * sugestões cruza função × disponibilidade × histórico recente.
 */

export async function getOwnedService(
  organizationId: string,
  serviceId: string
) {
  return prisma.service.findFirstOrThrow({
    where: { id: serviceId, organizationId },
  });
}

export async function assignMember(
  organizationId: string,
  serviceId: string,
  input: {
    instrumentId: string;
    memberId: string;
    isLeader?: boolean;
    substituteForId?: string | null;
  }
) {
  await getOwnedService(organizationId, serviceId);
  await prisma.instrument.findFirstOrThrow({
    where: { id: input.instrumentId, organizationId },
  });
  await prisma.member.findFirstOrThrow({
    where: { id: input.memberId, organizationId },
  });

  // Evita escalar a mesma pessoa duas vezes na mesma função do culto.
  const duplicate = await prisma.assignment.findFirst({
    where: {
      serviceId,
      memberId: input.memberId,
      instrumentId: input.instrumentId,
      status: { not: "SUBSTITUIDO" },
    },
  });
  if (duplicate) {
    throw new Error("Este músico já está escalado nesta função.");
  }

  const assignment = await prisma.assignment.create({
    data: {
      serviceId,
      instrumentId: input.instrumentId,
      memberId: input.memberId,
      isLeader: input.isLeader ?? false,
      substituteForId: input.substituteForId ?? null,
    },
  });

  // Substituição: o titular original sai da escala ativa.
  if (input.substituteForId) {
    await prisma.assignment.update({
      where: { id: input.substituteForId },
      data: { status: "SUBSTITUIDO" },
    });
  }

  return assignment;
}

export async function updateAssignmentStatus(
  organizationId: string,
  assignmentId: string,
  status: AssignmentStatus
) {
  await prisma.assignment.findFirstOrThrow({
    where: { id: assignmentId, service: { organizationId } },
  });
  return prisma.assignment.update({
    where: { id: assignmentId },
    data: { status, respondedAt: new Date() },
  });
}

export async function removeAssignment(
  organizationId: string,
  assignmentId: string
) {
  await prisma.assignment.findFirstOrThrow({
    where: { id: assignmentId, service: { organizationId } },
  });
  return prisma.assignment.delete({ where: { id: assignmentId } });
}

/* ---------- Motor de sugestões ---------- */

export interface MemberSuggestion {
  memberId: string;
  name: string;
  isPrimary: boolean;
  level: string;
  available: boolean;
  unavailableReason: string | null;
  recentAssignments: number;
  alreadyInService: boolean;
}

/**
 * Sugere músicos para uma função em um culto, em ordem de adequação:
 * disponíveis primeiro; instrumento principal antes de secundário; maior
 * nível; menos escalados nos últimos 90 dias (distribui a carga).
 */
export async function suggestMembers(
  organizationId: string,
  serviceId: string,
  instrumentId: string
): Promise<MemberSuggestion[]> {
  const service = await getOwnedService(organizationId, serviceId);
  const serviceDate = new Date(service.date);
  const serviceDay = serviceDate.toISOString().slice(0, 10);
  const serviceWeekday = serviceDate.getUTCDay();

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const [candidates, activeAssignments] = await Promise.all([
    prisma.memberInstrument.findMany({
      where: {
        instrumentId,
        member: { organizationId, isActive: true },
      },
      include: {
        member: {
          include: {
            availability: true,
            assignments: {
              where: {
                status: { not: "SUBSTITUIDO" },
                service: { date: { gte: ninetyDaysAgo } },
              },
              select: { id: true },
            },
          },
        },
      },
    }),
    prisma.assignment.findMany({
      where: { serviceId, status: { not: "SUBSTITUIDO" } },
      select: { memberId: true },
    }),
  ]);

  const inServiceIds = new Set(
    activeAssignments.map((a) => a.memberId).filter(Boolean)
  );

  const levelRank: Record<string, number> = {
    PROFISSIONAL: 4,
    AVANCADO: 3,
    INTERMEDIARIO: 2,
    INICIANTE: 1,
  };

  const suggestions = candidates.map((candidate) => {
    const blocking = candidate.member.availability.find((entry) => {
      if (entry.available) return false;
      if (entry.date) {
        return entry.date.toISOString().slice(0, 10) === serviceDay;
      }
      return entry.weekday === serviceWeekday;
    });

    return {
      memberId: candidate.memberId,
      name: candidate.member.name,
      isPrimary: candidate.isPrimary,
      level: candidate.level,
      available: !blocking,
      unavailableReason: blocking?.reason ?? (blocking ? "Indisponível" : null),
      recentAssignments: candidate.member.assignments.length,
      alreadyInService: inServiceIds.has(candidate.memberId),
    };
  });

  return suggestions.sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    const levelDiff = (levelRank[b.level] ?? 0) - (levelRank[a.level] ?? 0);
    if (levelDiff !== 0) return levelDiff;
    return a.recentAssignments - b.recentAssignments;
  });
}
