"use client";

import * as React from "react";
import { Loader2, Pause, Play } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";

interface AudioPlayerProps {
  src: string;
}

/** Player de áudio com waveform (WaveSurfer) — playbacks, guias e cliques. */
export function AudioPlayer({ src }: AudioPlayerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const wavesurferRef = React.useRef<WaveSurfer | null>(null);
  const [ready, setReady] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const styles = getComputedStyle(document.documentElement);
    const primary = `hsl(${styles.getPropertyValue("--primary").trim()})`;
    const muted = `hsl(${styles.getPropertyValue("--muted-foreground").trim()} / 0.4)`;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height: 40,
      waveColor: muted,
      progressColor: primary,
      cursorWidth: 0,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      url: src,
    });

    ws.on("ready", () => {
      setReady(true);
      setDuration(ws.getDuration());
    });
    ws.on("play", () => setPlaying(true));
    ws.on("pause", () => setPlaying(false));
    ws.on("finish", () => setPlaying(false));
    ws.on("timeupdate", (time) => setCurrent(time));

    wavesurferRef.current = ws;
    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [src]);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label={playing ? "Pausar" : "Tocar"}
        disabled={!ready}
        onClick={() => wavesurferRef.current?.playPause()}
      >
        {!ready ? (
          <Loader2 className="animate-spin" />
        ) : playing ? (
          <Pause />
        ) : (
          <Play />
        )}
      </Button>
      <div ref={containerRef} className="min-w-0 flex-1" />
      <span className="shrink-0 font-mono text-xs text-muted-foreground">
        {formatDuration(Math.floor(current))} /{" "}
        {formatDuration(Math.floor(duration))}
      </span>
    </div>
  );
}
