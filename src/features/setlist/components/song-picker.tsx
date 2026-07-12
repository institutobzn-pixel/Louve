"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GitBranch, Library, Loader2, Music2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  addSongToSetlistAction,
  quickCreateSongAction,
  searchSongsAction,
} from "../actions";
import {
  quickSongFormSchema,
  type QuickSongFormValues,
} from "../schema";

type PickerSong = Awaited<ReturnType<typeof searchSongsAction>>[number];

interface SongPickerProps {
  serviceId: string;
}

/**
 * Seletor de músicas do setlist — duas fontes, conforme o prompt-mestre:
 * Biblioteca Oficial ou Músicas em Implantação. Inclui cadastro rápido
 * (o módulo completo da Biblioteca chega na Fase 3).
 */
export function SongPicker({ serviceId }: SongPickerProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [source, setSource] = React.useState<"library" | "implementation">(
    "library"
  );
  const [query, setQuery] = React.useState("");
  const [songs, setSongs] = React.useState<PickerSong[] | null>(null);
  const [showQuickForm, setShowQuickForm] = React.useState(false);
  const [addingId, setAddingId] = React.useState<string | null>(null);

  // Busca (debounced) sempre que a fonte ou o termo mudarem.
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setSongs(null);
    const timer = setTimeout(async () => {
      const result = await searchSongsAction(source, query || undefined);
      if (!cancelled) setSongs(result);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, source, query]);

  async function handleAdd(song: PickerSong) {
    setAddingId(song.id);
    const result = await addSongToSetlistAction(serviceId, song.id);
    setAddingId(null);
    if (result.ok) {
      toast.success(`"${song.name}" adicionada ao setlist.`);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const quickForm = useForm<QuickSongFormValues>({
    resolver: zodResolver(quickSongFormSchema),
    defaultValues: { name: "", artist: "", originalKey: "", bpm: "", duration: "" },
  });

  async function handleQuickCreate(values: QuickSongFormValues) {
    const result = await quickCreateSongAction(serviceId, values);
    if (result.ok) {
      toast.success(`"${values.name}" criada e adicionada ao setlist.`);
      quickForm.reset();
      setShowQuickForm(false);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery("");
          setShowQuickForm(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus /> Adicionar música
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Adicionar música ao setlist</DialogTitle>
          <DialogDescription>
            Escolha da Biblioteca Oficial ou das Músicas em Implantação.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={source}
          onValueChange={(v) => setSource(v as typeof source)}
        >
          <TabsList className="w-full">
            <TabsTrigger value="library" className="flex-1">
              <Library className="h-4 w-4" /> Biblioteca Oficial
            </TabsTrigger>
            <TabsTrigger value="implementation" className="flex-1">
              <GitBranch className="h-4 w-4" /> Em Implantação
            </TabsTrigger>
          </TabsList>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou artista…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <TabsContent value={source} className="mt-3">
            {songs === null ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : songs.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                {source === "library" ? (
                  <>Nenhuma música encontrada na biblioteca.</>
                ) : (
                  <>
                    Nenhuma música em implantação.
                    <br />O pipeline de implantação chega na Fase 7.
                  </>
                )}
              </div>
            ) : (
              <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                {songs.map((song) => (
                  <li key={song.id}>
                    <button
                      type="button"
                      onClick={() => handleAdd(song)}
                      disabled={addingId !== null}
                      className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 disabled:opacity-60"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                        <Music2 className="h-4 w-4 text-primary" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {song.name}
                        </span>
                        {song.artist ? (
                          <span className="block truncate text-xs text-muted-foreground">
                            {song.artist}
                          </span>
                        ) : null}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {song.originalKey ? (
                          <Badge variant="outline" className="font-mono">
                            {song.originalKey}
                          </Badge>
                        ) : null}
                        {addingId === song.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>

        {/* Cadastro rápido */}
        {showQuickForm ? (
          <form
            onSubmit={quickForm.handleSubmit(handleQuickCreate)}
            className="space-y-3 rounded-xl border bg-muted/40 p-4"
          >
            <p className="text-sm font-medium">Nova música (cadastro rápido)</p>
            <div className="space-y-1.5">
              <Label htmlFor="qs-name">Nome *</Label>
              <Input id="qs-name" {...quickForm.register("name")} />
              {quickForm.formState.errors.name ? (
                <p className="text-xs text-danger">
                  {quickForm.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="qs-artist">Artista</Label>
                <Input id="qs-artist" {...quickForm.register("artist")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qs-key">Tom</Label>
                <Input
                  id="qs-key"
                  placeholder="Ex.: G"
                  className="font-mono"
                  {...quickForm.register("originalKey")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qs-bpm">BPM</Label>
                <Input
                  id="qs-bpm"
                  inputMode="numeric"
                  className="font-mono"
                  {...quickForm.register("bpm")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qs-duration">Duração</Label>
                <Input
                  id="qs-duration"
                  placeholder="m:ss"
                  className="font-mono"
                  {...quickForm.register("duration")}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowQuickForm(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={quickForm.formState.isSubmitting}>
                {quickForm.formState.isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : null}
                Criar e adicionar
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowQuickForm(true)}
          >
            <Plus /> Nova música (cadastro rápido)
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
