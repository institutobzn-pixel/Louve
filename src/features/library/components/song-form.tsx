"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  songFormSchema,
  type SongFormValues,
} from "../schema";

interface SongFormProps {
  defaultValues?: Partial<SongFormValues>;
  submitLabel: string;
  onSubmit: (values: SongFormValues) => Promise<void> | void;
}

/** Formulário da música — compartilhado entre criação e edição. */
export function SongForm({
  defaultValues,
  submitLabel,
  onSubmit,
}: SongFormProps) {
  const form = useForm<SongFormValues>({
    resolver: zodResolver(songFormSchema),
    defaultValues: {
      name: "",
      artist: "",
      composer: "",
      ccli: "",
      originalKey: "",
      bpm: "",
      duration: "",
      language: "",
      ...defaultValues,
    },
  });

  const { register, handleSubmit, formState } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="s-name">Nome *</Label>
        <Input id="s-name" {...register("name")} />
        {formState.errors.name ? (
          <p className="text-xs text-danger">{formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="s-artist">Artista</Label>
          <Input id="s-artist" {...register("artist")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-composer">Compositor</Label>
          <Input id="s-composer" {...register("composer")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="s-key">Tom original</Label>
          <Input
            id="s-key"
            placeholder="Ex.: G"
            className="font-mono"
            {...register("originalKey")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-bpm">BPM</Label>
          <Input
            id="s-bpm"
            inputMode="numeric"
            className="font-mono"
            {...register("bpm")}
          />
          {formState.errors.bpm ? (
            <p className="text-xs text-danger">{formState.errors.bpm.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-duration">Duração</Label>
          <Input
            id="s-duration"
            placeholder="m:ss"
            className="font-mono"
            {...register("duration")}
          />
          {formState.errors.duration ? (
            <p className="text-xs text-danger">
              {formState.errors.duration.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-ccli">CCLI</Label>
          <Input id="s-ccli" className="font-mono" {...register("ccli")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="s-language">Idioma</Label>
        <Input id="s-language" placeholder="Ex.: Português" {...register("language")} />
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
