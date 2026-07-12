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
import { createMemberAction } from "../actions";
import type { MemberFormValues } from "../schema";
import { MemberForm } from "./member-form";

export function CreateMemberDialog() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  async function handleSubmit(values: MemberFormValues) {
    const result = await createMemberAction(values);
    if (result.ok) {
      toast.success("Músico cadastrado.");
      setOpen(false);
      router.push(`/equipe/${result.data.id}`);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Novo músico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastrar músico</DialogTitle>
          <DialogDescription>
            Depois de criar, defina instrumentos e disponibilidade no perfil.
          </DialogDescription>
        </DialogHeader>
        <MemberForm submitLabel="Cadastrar" onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
