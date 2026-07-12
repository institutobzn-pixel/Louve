/** Visões serializadas (RSC → client) da escala. */

export interface AssignmentView {
  id: string;
  memberId: string | null;
  memberName: string | null;
  instrumentId: string;
  instrumentName: string;
  categoryKey: string;
  isLeader: boolean;
  /** Visualizou a escala no app do músico. */
  seen: boolean;
  /** Indisponibilidade do membro na data do culto (não impede escalar). */
  unavailableReason: string | null;
}

export interface ScheduleCategoryView {
  key: string;
  label: string;
  instruments: Array<{ id: string; name: string }>;
}
