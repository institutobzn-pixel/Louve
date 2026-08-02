import { prisma } from "@/server/db";

/**
 * Regras de negócio do App do Músico (docs/06 e 07 · Fase 5).
 * O músico enxerga apenas o que é dele: agenda, escala, ensaio e avisos.
 */

/** Cultos futuros (e recentes) em que o músico está escalado. */
export async function getMyServices(organizationId: string, memberId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return prisma.assignment.findMany({
    where: {
      memberId,
      status: { not: "SUBSTITUIDO" },
      service: {
        organizationId,
        status: { notIn: ["CANCELADO"] },
        date: { gte: thirtyDaysAgo },
      },
    },
    include: {
      instrument: { include: { category: true } },
      service: { include: { type: true, worshipLeader: true } },
    },
    orderBy: { service: { date: "asc" } },
  });
}

/** Detalhe de um culto na visão do músico (só se estiver escalado). */
export async function getMyServiceDetail(
  organizationId: string,
  memberId: string,
  serviceId: string
) {
  const assignment = await prisma.assignment.findFirst({
    where: {
      memberId,
      serviceId,
      status: { not: "SUBSTITUIDO" },
      service: { organizationId },
    },
    include: {
      instrument: { include: { category: true } },
      service: {
        include: {
          type: true,
          worshipLeader: true,
          notices: true,
          setlist: {
            include: {
              items: {
                include: {
                  song: true,
                  version: {
                    include: { videos: { orderBy: { sortOrder: "asc" } } },
                  },
                },
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
  });
  return assignment;
}

/**
 * Marca as escalas de um culto como vistas pelo músico — a notificação
 * "Nova escala" some do app e o líder vê o ✓✓ na gestão.
 */
export async function markAssignmentsSeen(
  organizationId: string,
  memberId: string,
  serviceId: string
) {
  return prisma.assignment.updateMany({
    where: {
      memberId,
      serviceId,
      seenAt: null,
      service: { organizationId },
    },
    data: { seenAt: new Date() },
  });
}

/**
 * Conteúdo do Modo Ensaio Inteligente: o setlist do culto com os arquivos
 * relevantes para a FUNÇÃO do músico (docs/06). O recorte por função é
 * feito na camada de apresentação a partir da categoria/instrumento.
 */
export async function getRehearsalContent(
  organizationId: string,
  memberId: string,
  serviceId: string
) {
  const assignment = await prisma.assignment.findFirst({
    where: {
      memberId,
      serviceId,
      status: { not: "SUBSTITUIDO" },
      service: { organizationId },
    },
    include: {
      instrument: { include: { category: true } },
      service: {
        include: {
          type: true,
          setlist: {
            include: {
              items: {
                include: {
                  song: true,
                  version: {
                    include: {
                      files: true,
                      videos: { orderBy: { sortOrder: "asc" } },
                      sections: { orderBy: { sortOrder: "asc" } },
                    },
                  },
                },
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!assignment) return null;

  // Itens sem versão definida usam os arquivos de todas as versões da música.
  const itemsWithFallback = await Promise.all(
    (assignment.service.setlist?.items ?? []).map(async (item) => {
      if (item.version) {
        return { item, files: item.version.files };
      }
      const versions = await prisma.songVersion.findMany({
        where: { songId: item.songId },
        include: { files: true },
      });
      return { item, files: versions.flatMap((v) => v.files) };
    })
  );

  return { assignment, items: itemsWithFallback };
}
