import { z } from "zod";

import { youtubeVideoId } from "@/lib/youtube";

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
  chordChartUrl: z
    .string()
    .max(300)
    .optional()
    .refine(
      (v) => {
        if (!v || v.trim() === "") return true;
        try {
          const u = new URL(v.trim());
          return u.protocol === "http:" || u.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Cole um link válido (ex.: cifraclub.com.br/...)" }
    ),
  chordChartText: z.string().max(20000).optional(),
  /** Extensão da melodia neste tom, em número MIDI (0–127). */
  melodyLowNote: z.number().int().min(0).max(127).nullable().optional(),
  melodyHighNote: z.number().int().min(0).max(127).nullable().optional(),
});

export type VersionFormValues = z.infer<typeof versionFormSchema>;

/** Um vídeo (YouTube) anexado a uma versão, com rótulo. */
export const videoFormSchema = z.object({
  label: z.string().min(1, "Dê um nome ao vídeo").max(40),
  url: z
    .string()
    .min(1, "Cole o link do YouTube")
    .refine((v) => youtubeVideoId(v) !== null, {
      message: "Link inválido do YouTube (ex.: youtube.com/watch?v=…)",
    }),
});

export type VideoFormValues = z.infer<typeof videoFormSchema>;

/** Um trecho do arranjo (Intro, Verso, Refrão…). */
export const sectionFormSchema = z.object({
  name: z.string().min(1, "Dê um nome ao trecho").max(40),
  measures: z
    .string()
    .regex(/^\d{0,3}$/, "Informe o número de compassos")
    .optional(),
  notes: z.string().max(120).optional(),
});

export type SectionFormValues = z.infer<typeof sectionFormSchema>;

/** Sugestões de trecho, na ordem em que costumam aparecer. */
export const sectionSuggestions = [
  "Intro",
  "Verso",
  "Pré-refrão",
  "Refrão",
  "Ponte",
  "Solo",
  "Final",
] as const;

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
