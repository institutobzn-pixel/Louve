import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Formatadores de data/hora do app (pt-BR). */

export function formatDateLong(date: Date) {
  return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDateShort(date: Date) {
  return format(date, "dd/MM/yyyy");
}

export function formatMonthYear(date: Date) {
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

export function formatWeekday(date: Date) {
  return format(date, "EEE", { locale: ptBR });
}

export function formatDayOfMonth(date: Date) {
  return format(date, "dd");
}

/** Date → "YYYY-MM-DD" (para inputs type=date), no fuso UTC do valor salvo. */
export function toDateInputValue(date: Date) {
  return format(new Date(date.toISOString().slice(0, 10) + "T12:00:00"), "yyyy-MM-dd");
}
