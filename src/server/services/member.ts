import type { InstrumentCategoryKey, SkillLevel } from "@prisma/client";

import { prisma } from "@/server/db";

/** Regras de negócio da Equipe (docs/04 · módulo Equipe da Fase 3). */

export interface MemberInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  birthday?: Date | null;
  level?: SkillLevel;
  notes?: string | null;
}

export async function createMember(organizationId: string, input: MemberInput) {
  return prisma.member.create({ data: { organizationId, ...input } });
}

export async function updateMember(
  organizationId: string,
  memberId: string,
  input: MemberInput & { isActive?: boolean }
) {
  return prisma.member.update({
    where: { id: memberId, organizationId },
    data: input,
  });
}

export async function setMemberActive(
  organizationId: string,
  memberId: string,
  isActive: boolean
) {
  return prisma.member.update({
    where: { id: memberId, organizationId },
    data: { isActive },
  });
}

export async function getMembers(organizationId: string, query?: string) {
  return prisma.member.findMany({
    where: {
      organizationId,
      ...(query
        ? { name: { contains: query, mode: "insensitive" } }
        : {}),
    },
    include: {
      instruments: {
        include: { instrument: { include: { category: true } } },
        orderBy: { isPrimary: "desc" },
      },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

export async function getMemberById(
  organizationId: string,
  memberId: string
) {
  return prisma.member.findUnique({
    where: { id: memberId, organizationId },
    include: {
      instruments: {
        include: { instrument: { include: { category: true } } },
        orderBy: { isPrimary: "desc" },
      },
      availability: { orderBy: [{ weekday: "asc" }, { date: "asc" }] },
      assignments: {
        include: {
          service: { include: { type: true } },
          instrument: true,
        },
        orderBy: { service: { date: "desc" } },
        take: 20,
      },
    },
  });
}

export async function addMemberInstrument(
  organizationId: string,
  memberId: string,
  input: { instrumentId: string; isPrimary: boolean; level: SkillLevel }
) {
  // Garante que membro e instrumento pertencem ao tenant.
  await prisma.member.findFirstOrThrow({
    where: { id: memberId, organizationId },
  });
  await prisma.instrument.findFirstOrThrow({
    where: { id: input.instrumentId, organizationId },
  });

  return prisma.memberInstrument.upsert({
    where: {
      memberId_instrumentId: { memberId, instrumentId: input.instrumentId },
    },
    update: { isPrimary: input.isPrimary, level: input.level },
    create: { memberId, ...input },
  });
}

export async function removeMemberInstrument(
  organizationId: string,
  memberId: string,
  instrumentId: string
) {
  await prisma.member.findFirstOrThrow({
    where: { id: memberId, organizationId },
  });
  return prisma.memberInstrument.delete({
    where: { memberId_instrumentId: { memberId, instrumentId } },
  });
}

export interface AvailabilityInput {
  date?: Date | null;
  weekday?: number | null;
  reason?: string | null;
}

export async function addAvailability(
  organizationId: string,
  memberId: string,
  input: AvailabilityInput
) {
  await prisma.member.findFirstOrThrow({
    where: { id: memberId, organizationId },
  });
  // Entradas registram INDISPONIBILIDADE (available = false).
  return prisma.availability.create({
    data: { memberId, available: false, ...input },
  });
}

export async function removeAvailability(
  organizationId: string,
  availabilityId: string
) {
  await prisma.availability.findFirstOrThrow({
    where: { id: availabilityId, member: { organizationId } },
  });
  return prisma.availability.delete({ where: { id: availabilityId } });
}

/**
 * Instrumentos ATIVOS do tenant agrupados por categoria (para escala, selects
 * e perfil do músico). Categorias sem instrumento ativo não aparecem.
 */
export async function getInstrumentsByCategory(organizationId: string) {
  const categories = await prisma.instrumentCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      instruments: {
        where: { organizationId, isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  return categories
    .filter((c) => c.instruments.length > 0)
    .map((c) => ({
      key: c.key,
      label: c.label,
      instruments: c.instruments.map((i) => ({ id: i.id, name: i.name })),
    }));
}

/**
 * Catálogo COMPLETO (ativos e inativos) para a tela de Configurações —
 * a igreja escolhe quais instrumentos/funções usa.
 */
export async function getInstrumentCatalog(organizationId: string) {
  const categories = await prisma.instrumentCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      instruments: {
        where: { organizationId },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  return categories.map((c) => ({
    key: c.key,
    label: c.label,
    instruments: c.instruments.map((i) => ({
      id: i.id,
      name: i.name,
      isActive: i.isActive,
    })),
  }));
}

/** Ativa/desativa um instrumento (a igreja escolhe o que usa). */
export async function setInstrumentActive(
  organizationId: string,
  instrumentId: string,
  isActive: boolean
) {
  const result = await prisma.instrument.updateMany({
    where: { id: instrumentId, organizationId },
    data: { isActive },
  });
  if (result.count === 0) throw new Error("Instrumento não encontrado");
  return result;
}

/** Ativa/desativa uma categoria inteira de instrumentos de uma vez. */
export async function setCategoryActive(
  organizationId: string,
  categoryKey: InstrumentCategoryKey,
  isActive: boolean
) {
  return prisma.instrument.updateMany({
    where: { organizationId, category: { key: categoryKey } },
    data: { isActive },
  });
}

export type MemberListItem = Awaited<ReturnType<typeof getMembers>>[number];
export type MemberProfile = NonNullable<
  Awaited<ReturnType<typeof getMemberById>>
>;
