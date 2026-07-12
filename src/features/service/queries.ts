import { prisma } from "@/server/db";
import { getCurrentOrganization } from "@/server/org";
import * as serviceService from "@/server/services/service";

/** Leituras usadas pelos Server Components do módulo Planejamento. */

export async function getServicesForPlanning() {
  const org = await getCurrentOrganization();
  return serviceService.getServices(org.id);
}

export async function getServiceDetail(serviceId: string) {
  const org = await getCurrentOrganization();
  return serviceService.getServiceById(org.id, serviceId);
}

/** Opções para os selects do formulário (tipos de culto e possíveis ministros). */
export async function getServiceFormOptions() {
  const org = await getCurrentOrganization();

  const [types, members] = await Promise.all([
    prisma.serviceType.findMany({
      where: { organizationId: org.id },
      orderBy: { name: "asc" },
    }),
    prisma.member.findMany({
      where: { organizationId: org.id, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    types: types.map((t) => ({ value: t.id, label: t.name })),
    members: members.map((m) => ({ value: m.id, label: m.name })),
  };
}
