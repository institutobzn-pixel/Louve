"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { RoleKey } from "@prisma/client";
import {
  Eye,
  EyeOff,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { roleLabels } from "@/config/defaults";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/format";
import {
  createAnnouncementAction,
  deleteAnnouncementAction,
  togglePublishAction,
  updateAnnouncementAction,
} from "../actions";

export interface AnnouncementView {
  id: string;
  title: string;
  body: string | null;
  audience: RoleKey[];
  publishedAt: string | null;
}

const orderedRoles = Object.keys(roleLabels) as RoleKey[];

export function CommunicationManager({
  announcements,
}: {
  announcements: AnnouncementView[];
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<
    AnnouncementView | "new" | null
  >(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function togglePublish(a: AnnouncementView) {
    setBusyId(a.id);
    const result = await togglePublishAction(a.id, a.publishedAt === null);
    setBusyId(null);
    if (result.ok) {
      toast.success(a.publishedAt ? "Aviso despublicado." : "Aviso publicado.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function remove(a: AnnouncementView) {
    const result = await deleteAnnouncementAction(a.id);
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

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nenhum aviso ainda"
          description="Publique comunicados para a equipe, segmentados por papel."
          action={
            <Button onClick={() => setEditing("new")}>
              <Plus /> Novo aviso
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {announcements.map((a) => (
            <li key={a.id}>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{a.title}</p>
                      {a.publishedAt ? (
                        <Badge variant="success">
                          Publicado · {formatDateShort(new Date(a.publishedAt))}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Rascunho</Badge>
                      )}
                    </div>
                    {a.body ? (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {a.body}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {a.audience.length === 0 ? (
                        <Badge variant="outline">Toda a equipe</Badge>
                      ) : (
                        a.audience.map((role) => (
                          <Badge key={role} variant="outline">
                            {roleLabels[role]}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={a.publishedAt ? "Despublicar" : "Publicar"}
                      disabled={busyId === a.id}
                      onClick={() => togglePublish(a)}
                    >
                      {busyId === a.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : a.publishedAt ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${a.title}`}
                      onClick={() => setEditing(a)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir ${a.title}`}
                      className="text-muted-foreground hover:text-danger"
                      onClick={() => remove(a)}
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

      <AnnouncementDialog
        state={editing}
        onClose={() => setEditing(null)}
        onDone={() => router.refresh()}
      />
    </div>
  );
}

function AnnouncementDialog({
  state,
  onClose,
  onDone,
}: {
  state: AnnouncementView | "new" | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const isNew = state === "new";
  const announcement = isNew || state === null ? null : state;

  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [audience, setAudience] = React.useState<RoleKey[]>([]);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (state === null) return;
    setTitle(announcement?.title ?? "");
    setBody(announcement?.body ?? "");
    setAudience(announcement?.audience ?? []);
  }, [state, announcement]);

  function toggleRole(role: RoleKey) {
    setAudience((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  async function submit(publish: boolean) {
    if (!title.trim()) {
      toast.error("Informe o título.");
      return;
    }
    setBusy(true);
    const values = { title, body, audience, publish };
    const result = announcement
      ? await updateAnnouncementAction(announcement.id, values)
      : await createAnnouncementAction(values);
    setBusy(false);
    if (result.ok) {
      toast.success(
        announcement
          ? "Aviso salvo."
          : publish
            ? "Aviso publicado."
            : "Rascunho salvo."
      );
      onClose();
      onDone();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "Novo aviso" : "Editar aviso"}</DialogTitle>
          <DialogDescription>
            Deixe o público vazio para enviar a toda a equipe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="a-title">Título *</Label>
            <Input
              id="a-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-body">Mensagem</Label>
            <Textarea
              id="a-body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Público-alvo</Label>
            <div className="flex flex-wrap gap-2">
              {orderedRoles.map((role) => {
                const active = audience.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:bg-muted"
                    )}
                    aria-pressed={active}
                  >
                    {roleLabels[role]}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {audience.length === 0
                ? "Visível para toda a equipe."
                : `Visível para ${audience.length} papel(is).`}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {announcement ? (
            <Button onClick={() => submit(true)} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              Salvar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => submit(false)}
                disabled={busy}
              >
                Salvar rascunho
              </Button>
              <Button onClick={() => submit(true)} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : null}
                Publicar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
