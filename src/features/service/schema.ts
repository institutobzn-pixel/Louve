import { z } from "zod";

/** Contrato único do formulário de culto (cliente + servidor). */
export const serviceFormSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data do culto"),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido (HH:mm)")
    .or(z.literal(""))
    .optional(),
  typeId: z.string().optional(),
  theme: z.string().max(200).optional(),
  pastor: z.string().max(120).optional(),
  worshipLeaderId: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export const serviceStatusSchema = z.enum([
  "RASCUNHO",
  "PLANEJAMENTO",
  "CONFIRMADO",
  "CONCLUIDO",
  "CANCELADO",
]);

/** Converte valores do formulário para o input da camada de serviço. */
export function toServiceInput(values: ServiceFormValues) {
  return {
    // Meio-dia UTC evita mudar de dia em qualquer fuso horário.
    date: new Date(`${values.date}T12:00:00.000Z`),
    startTime: values.startTime || null,
    typeId: values.typeId || null,
    theme: values.theme?.trim() || null,
    pastor: values.pastor?.trim() || null,
    worshipLeaderId: values.worshipLeaderId || null,
    notes: values.notes?.trim() || null,
  };
}
