"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Disc3,
  Download,
  ExternalLink,
  FileAudio,
  FileText,
  Layers,
  Loader2,
  Music2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  addVersionAction,
  addVideoAction,
  removeFileAction,
  removeVersionAction,
  removeVideoAction,
  updateVersionAction,
} from "../actions";
import {
  fileKindLabels,
  fileKinds,
  versionFormSchema,
  videoFormSchema,
  type VersionFormValues,
  type VideoFormValues,
} from "../schema";
import { AudioPlayer } from "@/components/shared/audio-player";
import { Metronome } from "@/components/shared/metronome";
import { MultitrackMixer } from "@/components/shared/multitrack-mixer";
import { VideoGallery } from "@/components/shared/video-gallery";

export interface FileView {
  id: string;
  kind: keyof typeof fileKindLabels;
  name: string;
  sizeBytes: number | null;
  mimeType: string | null;
}

export interface VideoView {
  id: string;
  label: string;
  url: string;
}

export interface VersionView {
  id: string;
  label: string;
  key: string | null;
  bpm: number | null;
  notes: string | null;
  chordChartUrl: string | null;
  videos: VideoView[];
  files: FileView[];
}

interface VersionManagerProps {
  songId: string;
  versions: VersionView[];
}

/** Nome amigável da trilha a partir do arquivo (ex.: "baixo.mp3" → "Baixo"). */
function stemName(filename: string) {
  const base = filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

function kindIcon(kind: FileView["kind"], mime: string | null) {
  if (mime?.startsWith("audio/")) return FileAudio;
  if (kind === "PARTITURA" || kind === "CIFRA" || kind === "LETRA")
    return FileText;
  if (kind === "MULTITRACK") return Layers;
  return Music2;
}

export function VersionManager({ songId, versions }: VersionManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<VersionView | "new" | null>(
    null
  );

  async function handleRemoveVersion(version: VersionView) {
    const result = await removeVersionAction(songId, version.id);
    if (result.ok) {
      toast.success(`Versão "${version.label}" excluída.`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleRemoveFile(file: FileView) {
    const result = await removeFileAction(songId, file.id);
    if (result.ok) {
      toast.success("Arquivo excluído.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleRemoveVideo(videoId: string) {
    const result = await removeVideoAction(songId, videoId);
    if (result.ok) {
      toast.success("Vídeo removido.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Disc3 className="h-4 w-4" /> Versões
        </h2>
        <Button variant="outline" size="sm" onClick={() => setEditing("new")}>
          <Plus /> Nova versão
        </Button>
      </div>

      {versions.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Nenhuma versão ainda. Crie uma versão (ex.: &quot;Estúdio&quot;,
          &quot;Ao Vivo&quot;, &quot;Acústico&quot;) para anexar playback,
          partitura, multitracks e guia vocal.
        </p>
      ) : (
        versions.map((version) => (
          <Card key={version.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">{version.label}</CardTitle>
                {version.key ? (
                  <Badge variant="outline" className="font-mono">
                    {version.key}
                  </Badge>
                ) : null}
                {version.bpm ? (
                  <Badge variant="outline" className="font-mono">
                    {version.bpm} bpm
                  </Badge>
                ) : null}
                <span className="ml-auto flex flex-wrap items-center justify-end gap-1">
                  <AddVideoButton
                    songId={songId}
                    versionId={version.id}
                    onDone={() => router.refresh()}
                  />
                  <UploadFileButton
                    versionId={version.id}
                    onDone={() => router.refresh()}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar versão ${version.label}`}
                    onClick={() => setEditing(version)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir versão ${version.label}`}
                    className="text-muted-foreground hover:text-danger"
                    onClick={() => handleRemoveVersion(version)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </span>
              </div>
              {version.notes ? (
                <p className="text-sm text-muted-foreground">{version.notes}</p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-2">
              {version.chordChartUrl ? (
                <a
                  href={version.chordChartUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" /> Ver cifra (link externo)
                </a>
              ) : null}
              {version.bpm ? <Metronome bpm={version.bpm} /> : null}
              {version.videos.length > 0 ? (
                <VideoGallery
                  videos={version.videos}
                  onRemove={handleRemoveVideo}
                />
              ) : null}
              {(() => {
                const stems = version.files.filter(
                  (f) =>
                    f.kind === "MULTITRACK" && f.mimeType?.startsWith("audio/")
                );
                return stems.length >= 2 ? (
                  <MultitrackMixer
                    tracks={stems.map((f) => ({
                      id: f.id,
                      name: stemName(f.name),
                      src: `/api/files/${f.id}`,
                    }))}
                  />
                ) : null;
              })()}
              {version.files.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sem arquivos — use &quot;Enviar arquivo&quot; para anexar
                  playback, partitura, multitrack ou guia vocal.
                </p>
              ) : (
                version.files.map((file) => {
                  const Icon = kindIcon(file.kind, file.mimeType);
                  // Trilhas do mixer não repetem player individual.
                  const inMixer =
                    file.kind === "MULTITRACK" &&
                    file.mimeType?.startsWith("audio/") &&
                    version.files.filter(
                      (f) =>
                        f.kind === "MULTITRACK" &&
                        f.mimeType?.startsWith("audio/")
                    ).length >= 2;
                  const isAudio =
                    file.mimeType?.startsWith("audio/") && !inMixer;
                  return (
                    <div
                      key={file.id}
                      className="space-y-2 rounded-xl border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate text-sm font-medium">
                          {file.name}
                        </span>
                        <Badge variant="secondary">
                          {fileKindLabels[file.kind]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatSize(file.sizeBytes)}
                        </span>
                        <span className="ml-auto flex items-center">
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={`/api/files/${file.id}`}
                              download={file.name}
                              aria-label={`Baixar ${file.name}`}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Excluir ${file.name}`}
                            className="text-muted-foreground hover:text-danger"
                            onClick={() => handleRemoveFile(file)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </span>
                      </div>
                      {isAudio ? (
                        <AudioPlayer src={`/api/files/${file.id}`} />
                      ) : null}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        ))
      )}

      <VersionDialog
        songId={songId}
        state={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

/* ---------- Upload ---------- */

function UploadFileButton({
  versionId,
  onDone,
}: {
  versionId: string;
  onDone: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [kind, setKind] = React.useState<(typeof fileKinds)[number]>("PLAYBACK");
  const [uploading, setUploading] = React.useState(false);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("versionId", versionId);
      formData.set("kind", kind);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Falha no upload");
      toast.success(`"${file.name}" enviado.`);
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <span className="flex items-center gap-1.5">
      <Select
        value={kind}
        onValueChange={(v) => setKind(v as typeof kind)}
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fileKinds.map((k) => (
            <SelectItem key={k} value={k}>
              {fileKindLabels[k]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Upload />
        )}
        Enviar arquivo
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFile}
        aria-label="Selecionar arquivo"
      />
    </span>
  );
}

/* ---------- Adicionar vídeo (YouTube) ---------- */

function AddVideoButton({
  songId,
  versionId,
  onDone,
}: {
  songId: string;
  versionId: string;
  onDone: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: { label: "", url: "" },
  });

  async function onSubmit(values: VideoFormValues) {
    const result = await addVideoAction(songId, versionId, values);
    if (result.ok) {
      toast.success("Vídeo adicionado.");
      form.reset();
      setOpen(false);
      onDone();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Youtube className="text-red-600" /> Vídeo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar vídeo</DialogTitle>
          <DialogDescription>
            Cole um link do YouTube. Ele vira uma miniatura para a equipe
            assistir dentro do app.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="video-label">Nome *</Label>
            <Input
              id="video-label"
              placeholder='Ex.: "Original", "Ao vivo", "Tutorial"'
              {...form.register("label")}
            />
            {form.formState.errors.label ? (
              <p className="text-xs text-danger">
                {form.formState.errors.label.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="video-url">Link do YouTube *</Label>
            <Input
              id="video-url"
              type="url"
              inputMode="url"
              placeholder="https://youtube.com/watch?v=..."
              {...form.register("url")}
            />
            {form.formState.errors.url ? (
              <p className="text-xs text-danger">
                {form.formState.errors.url.message}
              </p>
            ) : null}
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

/* ---------- Diálogo de versão (criar/editar) ---------- */

function VersionDialog({
  songId,
  state,
  onClose,
}: {
  songId: string;
  state: VersionView | "new" | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const isNew = state === "new";
  const version = isNew || state === null ? null : state;

  const form = useForm<VersionFormValues>({
    resolver: zodResolver(versionFormSchema),
    values: {
      label: version?.label ?? "",
      key: version?.key ?? "",
      bpm: version?.bpm ? String(version.bpm) : "",
      notes: version?.notes ?? "",
      chordChartUrl: version?.chordChartUrl ?? "",
    },
  });

  async function onSubmit(values: VersionFormValues) {
    const result = version
      ? await updateVersionAction(songId, version.id, values)
      : await addVersionAction(songId, values);
    if (result.ok) {
      toast.success(version ? "Versão salva." : "Versão criada.");
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
          <DialogTitle>{isNew ? "Nova versão" : "Editar versão"}</DialogTitle>
          <DialogDescription>
            Cada versão tem seu tom, BPM e arquivos próprios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="v-label">Nome da versão *</Label>
            <Input
              id="v-label"
              placeholder='Ex.: "Estúdio", "Ao Vivo", "Acústico"'
              {...form.register("label")}
            />
            {form.formState.errors.label ? (
              <p className="text-xs text-danger">
                {form.formState.errors.label.message}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-key">Tom</Label>
              <Input
                id="v-key"
                placeholder="Ex.: G"
                className="font-mono"
                {...form.register("key")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-bpm">BPM</Label>
              <Input
                id="v-bpm"
                inputMode="numeric"
                className="font-mono"
                {...form.register("bpm")}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-notes">Observações</Label>
            <Textarea id="v-notes" rows={2} {...form.register("notes")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-chord-chart">Link da cifra</Label>
            <Input
              id="v-chord-chart"
              type="url"
              inputMode="url"
              placeholder="https://cifraclub.com.br/..."
              {...form.register("chordChartUrl")}
            />
            {form.formState.errors.chordChartUrl ? (
              <p className="text-xs text-danger">
                {form.formState.errors.chordChartUrl.message}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : null}
              {isNew ? "Criar versão" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
