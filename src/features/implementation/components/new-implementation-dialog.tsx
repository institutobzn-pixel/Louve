"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createImplementationAction,
  type NewImplFormValues,
} from "../actions";

const formSchema = z.object({
  name: z.string().min(1, "Informe o nome da música").max(200),
  artist: z.string().max(120).optional(),
  originalKey: z.string().max(8).optional(),
  bpm: z.string().regex(/^\d{0,3}$/, "BPM inválido").optional(),
  notes: z.string().max(1000).optional(),
});

export function NewImplementationDialog() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const form = useForm<NewImplFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", artist: "", originalKey: "", bpm: "", notes: "" },
  });

  async function onSubmit(values: NewImplFormValues) {
    const result = await createImplementationAction(values);
    if (result.ok) {
      toast.success("Música adicionada ao pipeline.");
      form.reset();
      setOpen(false);
      router.refresh();
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova música em implantação</DialogTitle>
          <DialogDescription>
            Entra em &quot;Em análise&quot;. Ao chegar em &quot;Implantada&quot;,
            migra automaticamente para a Biblioteca.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="i-name">Nome *</Label>
            <Input id="i-name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-xs text-danger">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="i-artist">Artista</Label>
            <Input id="i-artist" {...form.register("artist")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="i-key">Tom</Label>
              <Input
                id="i-key"
                placeholder="Ex.: G"
                className="font-mono"
                {...form.register("originalKey")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="i-bpm">BPM</Label>
              <Input
                id="i-bpm"
                inputMode="numeric"
                className="font-mono"
                {...form.register("bpm")}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="i-notes">Observações</Label>
            <Textarea id="i-notes" rows={2} {...form.register("notes")} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : null}
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
