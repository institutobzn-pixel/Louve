import { z } from "zod";

export const songFormSchema = z.object({
  name: z.string().min(1, "Informe o nome da música").max(200),
  artist: z.string().max(120).optional(),
  composer: z.string().max(120).optional(),
  ccli: z.string().max(30).optional(),
  originalKey: z.string().max(8).optional(),
  bpm: z
    .string()
    .regex(/^\d{0,3}$/, "BPM inválido")
    .optional(),
  duration: z
    .string()
    .regex(/^(\d{1,3}:[0-5]\d)?$/, "Use o formato m:ss (ex.: 4:30)")
    .optional(),
  language: z.string().max(40).optional(),
});

export type SongFormValues = z.infer<typeof songFormSchema>;

export const versionFormSchema = z.object({
  label: z.string().min(1, "Informe o nome da versão").max(80),
  key: z.string().max(8).optional(),
  bpm: z
    .string()
    .regex(/^\d{0,3}$/, "BPM inválido")
    .optional(),
  notes: z.string().max(500).optional(),
});

export type VersionFormValues = z.infer<typeof versionFormSchema>;

export const fileKinds = [
  "PLAYBACK",
  "PARTITURA",
  "MULTITRACK",
  "GUIA_VOCAL",
  "CIFRA",
  "LETRA",
  "CLIQUE",
  "OUTRO",
] as const;

export const fileKindLabels: Record<(typeof fileKinds)[number], string> = {
  PLAYBACK: "Playback",
  PARTITURA: "Partitura",
  MULTITRACK: "Multitrack",
  GUIA_VOCAL: "Guia Vocal",
  CIFRA: "Cifra",
  LETRA: "Letra",
  CLIQUE: "Clique",
  OUTRO: "Outro",
};

/** Limite de upload por arquivo (dev local e SaaS inicial). */
export const MAX_FILE_SIZE_MB = 50;
