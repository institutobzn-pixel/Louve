"use client";

import * as React from "react";
import { Play, Trash2, Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  youtubeEmbedUrl,
  youtubeThumbnail,
  youtubeVideoId,
} from "@/lib/youtube";

export interface VideoItem {
  id: string;
  label: string;
  url: string;
}

interface PlayableVideo extends VideoItem {
  videoId: string;
}

/**
 * Galeria de vídeos do YouTube: mostra as miniaturas e, ao clicar, abre um
 * player EMBUTIDO (modal) — a pessoa assiste dentro do app, sem sair.
 * Reutilizada na Biblioteca (com remover) e no App do Músico (só assistir).
 */
export function VideoGallery({
  videos,
  onRemove,
}: {
  videos: VideoItem[];
  onRemove?: (id: string) => void;
}) {
  const [active, setActive] = React.useState<PlayableVideo | null>(null);

  const playable: PlayableVideo[] = videos.flatMap((v) => {
    const videoId = youtubeVideoId(v.url);
    return videoId ? [{ ...v, videoId }] : [];
  });

  if (playable.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {playable.map((v) => (
          <div
            key={v.id}
            className="group relative overflow-hidden rounded-xl border"
          >
            <button
              type="button"
              onClick={() => setActive(v)}
              className="block aspect-video w-full"
              aria-label={`Assistir "${v.label}"`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youtubeThumbnail(v.videoId)}
                alt={`Miniatura do vídeo ${v.label}`}
                className="h-full w-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                  <Play className="h-5 w-5 translate-x-0.5 fill-current" />
                </span>
              </span>
              <span className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-left text-xs font-medium text-white">
                <Youtube className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{v.label}</span>
              </span>
            </button>
            {onRemove ? (
              <Button
                variant="secondary"
                size="icon"
                aria-label={`Remover vídeo ${v.label}`}
                className="absolute right-1.5 top-1.5 h-7 w-7 opacity-0 transition group-hover:opacity-100"
                onClick={() => onRemove(v.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600" />
              {active?.label}
            </DialogTitle>
          </DialogHeader>
          {active ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={youtubeEmbedUrl(active.videoId)}
                title={active.label}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
