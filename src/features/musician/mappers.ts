import type { getMyServices } from "@/server/services/musician";

import type { MyServiceCardData } from "./components/my-service-card";

type AssignmentWithService = Awaited<ReturnType<typeof getMyServices>>[number];

/** Assignment (com culto) → dados do cartão do músico. */
export function toMyServiceCardData(
  assignment: AssignmentWithService,
  memberId: string
): MyServiceCardData {
  return {
    assignmentId: assignment.id,
    memberId,
    serviceId: assignment.serviceId,
    date: new Date(assignment.service.date),
    startTime: assignment.service.startTime,
    typeName: assignment.service.type?.name ?? null,
    theme: assignment.service.theme,
    leaderName: assignment.service.worshipLeader?.name ?? null,
    instrumentName: assignment.instrument.name,
    isNew: assignment.seenAt === null,
  };
}
