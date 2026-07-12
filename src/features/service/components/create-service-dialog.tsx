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
import { createServiceAction } from "@/features/service/actions";
import type { ServiceFormValues } from "@/features/service/schema";
import {
  ServiceForm,
  type SelectOption,
} from "./service-form";

interface CreateServiceDialogProps {
  typeOptions: SelectOption[];
  memberOptions: SelectOption[];
}

export function CreateServiceDialog({
  typeOptions,
  memberOptions,
}: CreateServiceDialogProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  async function handleSubmit(values: ServiceFormValues) {
    const result = await createServiceAction(values);
    if (result.ok) {
      toast.success("Culto criado. Bom planejamento!");
      setOpen(false);
      router.push(`/planejamento/${result.data.id}`);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Planejar culto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Planejar novo culto</DialogTitle>
          <DialogDescription>
            Comece pelas informações básicas — setlist, escala e o restante
            vêm em seguida, na página do culto.
          </DialogDescription>
        </DialogHeader>
        <ServiceForm
          typeOptions={typeOptions}
          memberOptions={memberOptions}
          submitLabel="Criar culto"
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
