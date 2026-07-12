import { z } from "zod";

/** Edição de um item do setlist (versão, tom, BPM, duração, observações). */
export const setlistItemFormSchema = z.object({
  versionId: z.string().optional(),
  keyOverride: z.string().max(8).optional(),
  bpm: z
    .string()
    .regex(/^\d{0,3}$/, "BPM inválido")
    .optional(),
  duration: z
    .string()
    .regex(/^(\d{1,3}:[0-5]\d)?$/, "Use o formato m:ss (ex.: 4:30)")
    .optional(),
  notes: z.string().max(500).optional(),
});

export type SetlistItemFormValues = z.infer<typeof setlistItemFormSchema>;

/** Cadastro rápido de música a partir do seletor do setlist. */
export const quickSongFormSchema = z.object({
  name: z.string().min(1, "Informe o nome da música").max(200),
  artist: z.string().max(120).optional(),
  originalKey: z.string().max(8).optional(),
  bpm: z
    .string()
    .regex(/^\d{0,3}$/, "BPM inválido")
    .optional(),
  duration: z
    .string()
    .regex(/^(\d{1,3}:[0-5]\d)?$/, "Use o formato m:ss (ex.: 4:30)")
    .optional(),
});

export type QuickSongFormValues = z.infer<typeof quickSongFormSchema>;
