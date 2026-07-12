import type { AssignmentStatus } from "@prisma/client";

/** Visões serializadas (RSC → client) da escala. */

export interface AssignmentView {
  id: string;
  memberId: string | null;
  memberName: string | null;
  instrumentId: string;
  instrumentName: string;
  categoryKey: string;
  status: AssignmentStatus;
  isLeader: boolean;
}

export interface ScheduleCategoryView {
  key: string;
  label: string;
  instruments: Array<{ id: string; name: string }>;
}

export const assignmentStatusConfig: Record<
  AssignmentStatus,
  {
    label: string;
    variant: "default" | "secondary" | "success" | "warning" | "danger";
  }
> = {
  CONVIDADO: { label: "Convidado", variant: "warning" },
  CONFIRMADO: { label: "Confirmado", variant: "success" },
  RECUSADO: { label: "Recusou", variant: "danger" },
  SUBSTITUIDO: { label: "Substituído", variant: "secondary" },
};
