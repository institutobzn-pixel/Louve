"use client";

import * as React from "react";
import {
  Headphones,
  Loader2,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";

export interface MixerTrack {
  id: string;
  name: string;
  src: string;
}

interface MultitrackMixerProps {
  tracks: MixerTrack[];
}

interface LoadedTrack {
  id: string;
  name: string;
  buffer: AudioBuffer;
}

interface TrackState {
  volume: number; // 0..1
  muted: boolean;
  solo: boolean;
}

/**
 * Mixer de multitracks (Web Audio API): todas as trilhas tocam
 * sincronizadas, com volume / mudo / solo por instrumento, seek e loop.
 * Ideal para o Modo Ensaio — estudar isolando ou combinando instrumentos.
 */
export function MultitrackMixer({ tracks }: MultitrackMixerProps) {
  const ctxRef = React.useRef<AudioContext | null>(null);
  const masterGainRef = React.useRef<GainNode | null>(null);
  const gainNodesRef = React.useRef<Map<string, GainNode>>(new Map());
  const sourcesRef = React.useRef<AudioBufferSourceNode[]>([]);
  const startTimeRef = React.useRef(0); // ctx time quando começou a tocar
  const offsetRef = React.useRef(0); // posição (s) de onde tocar
  const loopRef = React.useRef(false);
  const rafRef = React.useRef<number | null>(null);

  const [loaded, setLoaded] = React.useState<LoadedTrack[] | null>(null);
  const [loadError, setLoadError] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [loop, setLoop] = React.useState(false);
  const [trackStates, setTrackStates] = React.useState<
    Record<string, TrackState>
  >(() =>
    Object.fromEntries(
      tracks.map((t) => [t.id, { volume: 0.85, muted: false, solo: false }])
    )
  );

  React.useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  // Carrega e decodifica todas as trilhas.
  React.useEffect(() => {
    let cancelled = false;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.connect(ctx.destination);
    masterGainRef.current = master;

    let done = 0;
    Promise.all(
      tracks.map(async (track) => {
        const res = await fetch(track.src);
        const arr = await res.arrayBuffer();
        const buffer = await ctx.decodeAudioData(arr);
        done += 1;
        if (!cancelled) setProgress(Math.round((done / tracks.length) * 100));
        return { id: track.id, name: track.name, buffer };
      })
    )
      .then((result) => {
        if (cancelled) return;
        setLoaded(result);
        setDuration(Math.max(...result.map((r) => r.buffer.duration)));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      sourcesRef.current.forEach((s) => {
        try {
          s.stop();
        } catch {
          /* já parado */
        }
      });
      ctx.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aplica ganhos (volume/mudo/solo) aos nós de ganho.
  const applyGains = React.useCallback(() => {
    const anySolo = Object.values(trackStates).some((s) => s.solo);
    const ctx = ctxRef.current;
    if (!ctx) return;
    for (const [id, node] of gainNodesRef.current) {
      const st = trackStates[id];
      if (!st) continue;
      const audible = anySolo ? st.solo && !st.muted : !st.muted;
      node.gain.setTargetAtTime(
        audible ? st.volume : 0,
        ctx.currentTime,
        0.015
      );
    }
  }, [trackStates]);

  React.useEffect(() => {
    applyGains();
  }, [applyGains]);

  function stopSources() {
    sourcesRef.current.forEach((s) => {
      try {
        s.onended = null;
        s.stop();
      } catch {
        /* já parado */
      }
    });
    sourcesRef.current = [];
    gainNodesRef.current.clear();
  }

  const startPlayback = React.useCallback(
    (fromOffset: number) => {
      const ctx = ctxRef.current;
      const master = masterGainRef.current;
      if (!ctx || !master || !loaded) return;

      stopSources();
      const anySolo = Object.values(trackStates).some((s) => s.solo);

      for (const track of loaded) {
        const source = ctx.createBufferSource();
        source.buffer = track.buffer;
        const gain = ctx.createGain();
        const st = trackStates[track.id];
        const audible = st
          ? anySolo
            ? st.solo && !st.muted
            : !st.muted
          : true;
        gain.gain.value = audible && st ? st.volume : 0;
        source.connect(gain);
        gain.connect(master);
        source.start(0, fromOffset);
        gainNodesRef.current.set(track.id, gain);
        sourcesRef.current.push(source);
      }

      startTimeRef.current = ctx.currentTime;
      offsetRef.current = fromOffset;
      setPlaying(true);
      tick();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loaded, trackStates]
  );

  function tick() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const loopStep = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const pos = offsetRef.current + (ctx.currentTime - startTimeRef.current);
      if (pos >= duration) {
        if (loopRef.current) {
          startPlayback(0);
          return;
        }
        stopSources();
        setPlaying(false);
        setCurrent(0);
        offsetRef.current = 0;
        return;
      }
      setCurrent(pos);
      rafRef.current = requestAnimationFrame(loopStep);
    };
    rafRef.current = requestAnimationFrame(loopStep);
  }

  async function togglePlay() {
    const ctx = ctxRef.current;
    if (!ctx || !loaded) return;
    if (ctx.state === "suspended") await ctx.resume();
    if (playing) {
      const pos =
        offsetRef.current + (ctx.currentTime - startTimeRef.current);
      offsetRef.current = Math.min(pos, duration);
      stopSources();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setPlaying(false);
      setCurrent(offsetRef.current);
    } else {
      startPlayback(offsetRef.current >= duration ? 0 : offsetRef.current);
    }
  }

  function seek(value: number) {
    offsetRef.current = value;
    setCurrent(value);
    if (playing) startPlayback(value);
  }

  function restart() {
    seek(0);
    if (!playing) void togglePlay();
  }

  function updateTrack(id: string, patch: Partial<TrackState>) {
    setTrackStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  if (loadError) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
        Não foi possível carregar as trilhas.
      </p>
    );
  }

  if (!loaded) {
    return (
      <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando trilhas… {progress}%
      </div>
    );
  }

  const anySolo = Object.values(trackStates).some((s) => s.solo);

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Headphones className="h-4 w-4 text-primary" />
        Mixer de trilhas
        <span className="text-xs font-normal text-muted-foreground">
          ({loaded.length} instrumentos)
        </span>
      </div>

      {/* Transporte */}
      <div className="flex items-center gap-2">
        <Button size="icon" aria-label={playing ? "Pausar" : "Tocar"} onClick={togglePlay}>
          {playing ? <Pause /> : <Play />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Recomeçar"
          onClick={restart}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={current}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Posição"
          className="mixer-seek h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted"
        />
        <span className="w-24 shrink-0 text-right font-mono text-xs text-muted-foreground">
          {formatDuration(Math.floor(current))} /{" "}
          {formatDuration(Math.floor(duration))}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={loop ? "Desativar loop" : "Ativar loop"}
          aria-pressed={loop}
          className={cn(loop && "bg-accent text-primary")}
          onClick={() => setLoop((p) => !p)}
        >
          <Repeat className="h-4 w-4" />
        </Button>
      </div>

      {/* Trilhas */}
      <ul className="space-y-1.5">
        {loaded.map((track) => {
          const st = trackStates[track.id];
          const dimmed = anySolo ? !st.solo : st.muted;
          return (
            <li
              key={track.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-opacity",
                dimmed && "opacity-50"
              )}
            >
              <span className="w-28 shrink-0 truncate text-sm font-medium">
                {track.name}
              </span>

              <button
                type="button"
                onClick={() => updateTrack(track.id, { muted: !st.muted })}
                aria-pressed={st.muted}
                className={cn(
                  "flex h-6 w-7 items-center justify-center rounded text-[11px] font-bold",
                  st.muted
                    ? "bg-danger text-danger-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
                aria-label={`Mudo ${track.name}`}
                title="Mudo"
              >
                M
              </button>
              <button
                type="button"
                onClick={() => updateTrack(track.id, { solo: !st.solo })}
                aria-pressed={st.solo}
                className={cn(
                  "flex h-6 w-7 items-center justify-center rounded text-[11px] font-bold",
                  st.solo
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
                aria-label={`Solo ${track.name}`}
                title="Solo (isolar)"
              >
                S
              </button>

              {st.muted ? (
                <VolumeX className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={st.volume}
                onChange={(e) =>
                  updateTrack(track.id, { volume: Number(e.target.value) })
                }
                aria-label={`Volume ${track.name}`}
                className="mixer-vol h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
