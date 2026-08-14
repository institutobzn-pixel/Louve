/** Visões serializadas (RSC → client) da escala. */

export interface AssignmentView {
  id: string;
  memberId: string | null;
  memberName: string | null;
  /** Telefone do músico, para o aviso no WhatsApp. */
  memberPhone: string | null;
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

/** Dados do culto usados nas mensagens de aviso (WhatsApp). */
export interface ScheduleServiceView {
  title: string;
  date: string;
  startTime: string | null;
}
