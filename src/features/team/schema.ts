import { z } from "zod";

export const skillLevels = [
  "INICIANTE",
  "INTERMEDIARIO",
  "AVANCADO",
  "PROFISSIONAL",
] as const;

export const skillLevelLabels: Record<(typeof skillLevels)[number], string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
  PROFISSIONAL: "Profissional",
};

export const memberFormSchema = z.object({
  name: z.string().min(1, "Informe o nome").max(120),
  email: z
    .string()
    .email("E-mail inválido")
    .or(z.literal(""))
    .optional(),
  phone: z.string().max(30).optional(),
  birthday: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Data inválida")
    .optional(),
  level: z.enum(skillLevels),
  notes: z.string().max(1000).optional(),
  /** Extensão vocal confortável, em número MIDI (0–127). */
  vocalLowNote: z.number().int().min(0).max(127).nullable().optional(),
  vocalHighNote: z.number().int().min(0).max(127).nullable().optional(),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;

export const memberInstrumentSchema = z.object({
  instrumentId: z.string().min(1, "Selecione o instrumento"),
  isPrimary: z.boolean(),
  level: z.enum(skillLevels),
});

export type MemberInstrumentValues = z.infer<typeof memberInstrumentSchema>;

export const weekdays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

export const availabilityFormSchema = z
  .object({
    kind: z.enum(["date", "weekday"]),
    date: z
      .string()
      .regex(/^(\d{4}-\d{2}-\d{2})?$/)
      .optional(),
    weekday: z.string().optional(),
    reason: z.string().max(200).optional(),
  })
  .refine(
    (v) => (v.kind === "date" ? Boolean(v.date) : v.weekday !== undefined && v.weekday !== ""),
    { message: "Informe a data ou o dia da semana" }
  );

export type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>;

/** Converte valores do formulário para o input da camada de serviço. */
export function toMemberInput(values: MemberFormValues) {
  return {
    name: values.name.trim(),
    email: values.email?.trim() || null,
    phone: values.phone?.trim() || null,
    birthday: values.birthday
      ? new Date(`${values.birthday}T12:00:00.000Z`)
      : null,
    level: values.level,
    notes: values.notes?.trim() || null,
    vocalLowNote: values.vocalLowNote ?? null,
    vocalHighNote: values.vocalHighNote ?? null,
  };
}
