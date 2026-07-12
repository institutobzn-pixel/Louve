"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ServiceStatus } from "@prisma/client";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteServiceAction,
  duplicateServiceAction,
  updateServiceStatusAction,
} from "@/features/service/actions";

const statusOptions: Array<{ value: ServiceStatus; label: string }> = [
  { value: "RASCUNHO", label: "Rascunho" },
  { value: "PLANEJAMENTO", label: "Em planejamento" },
  { value: "CONFIRMADO", label: "Confirmado" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Cancelado" },
];

interface ServiceActionsMenuProps {
  serviceId: string;
  status: ServiceStatus;
}

export function ServiceActionsMenu({
  serviceId,
  status,
}: ServiceActionsMenuProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function handleStatus(value: string) {
    const result = await updateServiceStatusAction(serviceId, value);
    if (result.ok) {
      toast.success("Status atualizado.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDuplicate() {
    const result = await duplicateServiceAction(serviceId);
    if (result.ok) {
      toast.success("Culto duplicado para a semana seguinte.");
      router.push(`/planejamento/${result.data.id}`);
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    setBusy(true);
    const result = await deleteServiceAction(serviceId);
    setBusy(false);
    if (result.ok) {
      toast.success("Culto excluído.");
      router.push("/planejamento");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Ações do culto">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={status} onValueChange={handleStatus}>
            {statusOptions.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleDuplicate}>
            <Copy /> Duplicar culto
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-danger focus:text-danger"
            onSelect={() => setConfirmDelete(true)}
          >
            <Trash2 /> Excluir culto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir este culto?</DialogTitle>
            <DialogDescription>
              O planejamento inteiro (setlist, escala, checklist) será removido.
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
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
