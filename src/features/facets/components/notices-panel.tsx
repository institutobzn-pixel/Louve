"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createNoticeAction,
  deleteNoticeAction,
  updateNoticeAction,
  type NoticeFormValues,
} from "../actions";

const noticeFormSchema = z.object({
  title: z.string().min(1, "Informe o título").max(120),
  body: z.string().max(2000).optional(),
});

export interface NoticeView {
  id: string;
  title: string;
  body: string | null;
}

interface NoticesPanelProps {
  serviceId: string;
  notices: NoticeView[];
}

/** Avisos específicos do culto — visíveis também no app do músico. */
export function NoticesPanel({ serviceId, notices }: NoticesPanelProps) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<NoticeView | "new" | null>(null);

  async function handleDelete(notice: NoticeView) {
    const result = await deleteNoticeAction(serviceId, notice.id);
    if (result.ok) {
      toast.success("Aviso excluído.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus /> Novo aviso
        </Button>
      </div>

      {notices.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nenhum aviso para este culto"
          description="Avisos aparecem para todos os escalados no app do músico."
        />
      ) : (
        <ul className="space-y-2">
          {notices.map((notice) => (
            <li key={notice.id}>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{notice.title}</p>
                    {notice.body ? (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {notice.body}
                      </p>
                    ) : null}
                  </div>
                  <span className="flex shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar aviso ${notice.title}`}
                      onClick={() => setEditing(notice)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir aviso ${notice.title}`}
                      className="text-muted-foreground hover:text-danger"
                      onClick={() => handleDelete(notice)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <NoticeDialog
        serviceId={serviceId}
        state={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function NoticeDialog({
  serviceId,
  state,
  onClose,
}: {
  serviceId: string;
  state: NoticeView | "new" | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const isNew = state === "new";
  const notice = isNew || state === null ? null : state;

  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    values: { title: notice?.title ?? "", body: notice?.body ?? "" },
  });

  async function onSubmit(values: NoticeFormValues) {
    const result = notice
      ? await updateNoticeAction(serviceId, notice.id, values)
      : await createNoticeAction(serviceId, values);
    if (result.ok) {
      toast.success(notice ? "Aviso salvo." : "Aviso publicado.");
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Novo aviso" : "Editar aviso"}</DialogTitle>
          <DialogDescription>
            O aviso fica visível para todos os escalados deste culto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="n-title">Título *</Label>
            <Input id="n-title" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-xs text-danger">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="n-body">Mensagem</Label>
            <Textarea id="n-body" rows={4} {...form.register("body")} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : null}
              {isNew ? "Publicar" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
