"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteSongAction } from "../actions";

export function SongDeleteButton({
  songId,
  songName,
}: {
  songId: string;
  songName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function handleDelete() {
    setBusy(true);
    const result = await deleteSongAction(songId);
    setBusy(false);
    if (result.ok) {
      toast.success("Música excluída da biblioteca.");
      router.push("/biblioteca");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label="Excluir música"
        className="text-muted-foreground hover:text-danger"
        onClick={() => setOpen(true)}
      >
        <Trash2 />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir &quot;{songName}&quot;?</DialogTitle>
            <DialogDescription>
              Todas as versões e arquivos serão removidos. Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={busy}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
