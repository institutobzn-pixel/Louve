"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateSongAction } from "../actions";
import type { SongFormValues } from "../schema";
import { SongForm } from "./song-form";

interface SongInfoFormProps {
  songId: string;
  defaultValues: Partial<SongFormValues>;
}

export function SongInfoForm({ songId, defaultValues }: SongInfoFormProps) {
  const router = useRouter();

  async function handleSubmit(values: SongFormValues) {
    const result = await updateSongAction(songId, values);
    if (result.ok) {
      toast.success("Música salva.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <SongForm
      defaultValues={defaultValues}
      submitLabel="Salvar alterações"
      onSubmit={handleSubmit}
    />
  );
}
