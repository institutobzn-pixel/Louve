/**
 * Links do WhatsApp (wa.me) para avisar a equipe sobre a escala.
 *
 * Sem API e sem custo: o app monta a mensagem pronta e o líder confirma o
 * envio no próprio WhatsApp. Se o músico não tiver telefone cadastrado, o
 * link abre sem destinatário (serve para colar no grupo).
 */

/**
 * Normaliza um telefone brasileiro para o formato que o wa.me espera
 * (só dígitos, com código do país). Retorna null se não parecer válido.
 *
 * Aceita "(11) 99999-8888", "11999998888", "+55 11 99999-8888".
 */
export function toWhatsappNumber(phone: string | null | undefined) {
  if (!phone) return null;

  let digits = phone.replace(/\D/g, "");
  // Zeros de discagem (0xx) não entram no formato internacional.
  digits = digits.replace(/^0+/, "");

  // Sem código do país: assume Brasil quando é DDD + número (10 ou 11).
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;

  // 55 + DDD (2) + número (8 ou 9).
  if (!/^55\d{10,11}$/.test(digits)) return null;
  return digits;
}

/** Link do WhatsApp com a mensagem pronta (destinatário é opcional). */
export function whatsappLink(message: string, phone?: string | null) {
  const number = toWhatsappNumber(phone);
  const text = encodeURIComponent(message);
  return number
    ? `https://wa.me/${number}?text=${text}`
    : `https://wa.me/?text=${text}`;
}

export interface ServiceSummary {
  /** Nome do culto (ex.: "Culto de Domingo"). */
  title: string;
  /** Data por extenso (ex.: "domingo, 3 de agosto de 2026"). */
  date: string;
  /** Horário no formato HH:mm, quando houver. */
  startTime?: string | null;
}

/** Aviso individual: "você foi escalado(a)". */
export function buildAssignmentMessage(
  memberName: string,
  instrumentName: string,
  service: ServiceSummary
) {
  const firstName = memberName.trim().split(/\s+/)[0];
  const when = service.startTime
    ? `${service.date} às ${service.startTime}`
    : service.date;

  return [
    `Olá, ${firstName}! 🎵`,
    "",
    `Você está escalado(a) para *${service.title}*.`,
    `📅 ${when}`,
    `🎸 Função: ${instrumentName}`,
    "",
    "Deus abençoe!",
  ].join("\n");
}

/** Resumo da escala inteira, para colar no grupo da equipe. */
export function buildScheduleMessage(
  service: ServiceSummary,
  lines: Array<{ instrumentName: string; memberName: string | null }>
) {
  const when = service.startTime
    ? `${service.date} às ${service.startTime}`
    : service.date;

  const body = lines.length
    ? lines.map(
        (l) => `• ${l.instrumentName}: ${l.memberName ?? "_em aberto_"}`
      )
    : ["_Ninguém escalado ainda._"];

  return [
    `*${service.title}*`,
    `📅 ${when}`,
    "",
    "*Escala:*",
    ...body,
    "",
    "Deus abençoe a todos! 🙌",
  ].join("\n");
}
