"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDuration } from "@/lib/format";
import { updateSetlistItemAction } from "../actions";
import {
  setlistItemFormSchema,
  type SetlistItemFormValues,
} from "../schema";
import type { SetlistItemView } from "../types";

const NONE = "__none__";

interface SetlistItemEditDialogProps {
  serviceId: string;
  item: SetlistItemView | null;
  onClose: () => void;
}

export function SetlistItemEditDialog({
  serviceId,
  item,
  onClose,
}: SetlistItemEditDialogProps) {
  const router = useRouter();

  const form = useForm<SetlistItemFormValues>({
    resolver: zodResolver(setlistItemFormSchema),
    values: item
      ? {
          versionId: item.versionId ?? "",
          keyOverride: item.keyOverride ?? "",
          bpm: item.bpmOverride ? String(item.bpmOverride) : "",
          duration: item.durationSec ? formatDuration(item.durationSec) : "",
          notes: item.notes ?? "",
        }
      : undefined,
  });

  const { register, handleSubmit, setValue, watch, formState } = form;
  const versionId = watch("versionId");

  async function onSubmit(values: SetlistItemFormValues) {
    if (!item) return;
    const result = await updateSetlistItemAction(serviceId, item.id, values);
    if (result.ok) {
      toast.success("Item atualizado.");
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item?.song.name}</DialogTitle>
          <DialogDescription>
            Ajustes desta música para este culto — a música original não é
            alterada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {item && item.song.versions.length > 0 ? (
            <div className="space-y-1.5">
              <Label>Versão</Label>
              <Select
                value={versionId || NONE}
                onValueChange={(v) => setValue("versionId", v === NONE ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a versão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sem versão definida</SelectItem>
                  {item.song.versions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="keyOverride">Tom</Label>
              <Input
                id="keyOverride"
                placeholder="Ex.: G, Em"
                className="font-mono"
                {...register("keyOverride")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bpm">BPM</Label>
              <Input
                id="bpm"
                inputMode="numeric"
                placeholder="Ex.: 72"
                className="font-mono"
                {...register("bpm")}
              />
              {formState.errors.bpm ? (
                <p className="text-xs text-danger">
                  {formState.errors.bpm.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duração</Label>
              <Input
                id="duration"
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Ex.: entrada direto no refrão, modulação no final…"
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : null}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
