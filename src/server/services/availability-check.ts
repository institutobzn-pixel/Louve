import type { Availability } from "@prisma/client";

/**
 * Verifica se um conjunto de indisponibilidades bloqueia uma data de culto.
 * Usado pelo motor de sugestões e pela exibição da escala montada.
 */
export function findBlockingAvailability(
  entries: Availability[],
  serviceDate: Date
): Availability | undefined {
  const serviceDay = serviceDate.toISOString().slice(0, 10);
  const serviceWeekday = serviceDate.getUTCDay();

  return entries.find((entry) => {
    if (entry.available) return false;
    if (entry.date) {
      return entry.date.toISOString().slice(0, 10) === serviceDay;
    }
    return entry.weekday === serviceWeekday;
  });
}
