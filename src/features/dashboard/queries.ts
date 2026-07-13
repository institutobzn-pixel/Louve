import { prisma } from "@/server/db";
import { getCurrentOrganization } from "@/server/org";
import * as serviceService from "@/server/services/service";

/** Agregados e listas do Dashboard (Fase 9). */
export async function getDashboardData() {
  const org = await getCurrentOrganization();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    upcomingCount,
    libraryCount,
    membersCount,
    implementationCount,
    services,
  ] = await Promise.all([
    prisma.service.count({
      where: {
        organizationId: org.id,
        date: { gte: today },
        status: { notIn: ["CANCELADO", "CONCLUIDO"] },
      },
    }),
    prisma.song.count({
      where: { organizationId: org.id, isInLibrary: true },
    }),
    prisma.member.count({
      where: { organizationId: org.id, isActive: true },
    }),
    prisma.songImplementation.count({
      where: { song: { organizationId: org.id, isInLibrary: false } },
    }),
    serviceService.getServices(org.id),
  ]);

  const upcoming = services
    .filter(
      (s) =>
        new Date(s.date) >= today &&
        s.status !== "CANCELADO" &&
        s.status !== "CONCLUIDO"
    )
    .slice(0, 5);

  return {
    stats: { upcomingCount, libraryCount, membersCount, implementationCount },
    upcoming,
  };
}
