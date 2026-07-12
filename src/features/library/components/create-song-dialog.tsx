"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createSongAction } from "../actions";
import type { SongFormValues } from "../schema";
import { SongForm } from "./song-form";

export function CreateSongDialog() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  async function handleSubmit(values: SongFormValues) {
    const result = await createSongAction(values);
    if (result.ok) {
      toast.success("Música adicionada à biblioteca.");
      setOpen(false);
      router.push(`/biblioteca/${result.data.id}`);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Nova música
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova música</DialogTitle>
          <DialogDescription>
            Depois de criar, adicione versões e arquivos na página da música.
          </DialogDescription>
        </DialogHeader>
        <SongForm submitLabel="Criar música" onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
