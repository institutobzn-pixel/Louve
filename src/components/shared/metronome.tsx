"use client";

import * as React from "react";
import { Minus, Play, Plus, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MetronomeProps {
  /** BPM inicial (vem do arranjo: versão, música ou override do setlist). */
  bpm: number;
  /** Batidas por compasso — a primeira recebe acento. */
  beatsPerMeasure?: number;
  className?: string;
}

const MIN_BPM = 30;
const MAX_BPM = 300;
/** De quanto em quanto o agendador acorda para olhar à frente. */
const LOOKAHEAD_MS = 25;
/** Quanto tempo de áudio é agendado à frente (evita falha no timing). */
const SCHEDULE_AHEAD_S = 0.12;

/**
 * Clique (metrônomo) gerado na hora a partir do BPM — sem depender de
 * arquivo enviado. O som é sintetizado pela Web Audio API e o agendamento
 * usa o relógio do próprio áudio, que não sofre com travadas da interface.
 */
export function Metronome({
  bpm: initialBpm,
  beatsPerMeasure = 4,
  className,
}: MetronomeProps) {
  const [bpm, setBpm] = React.useState(
    Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(initialBpm)))
  );
  const [playing, setPlaying] = React.useState(false);
  const [beat, setBeat] = React.useState(-1);

  const audioRef = React.useRef<AudioContext | null>(null);
  const timerRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);
  // Fila de batidas já agendadas, para acender o ponto na hora certa.
  const queueRef = React.useRef<Array<{ beat: number; time: number }>>([]);
  const nextTimeRef = React.useRef(0);
  const beatRef = React.useRef(0);
  // Lidos dentro do agendador: refs evitam recriar o loop a cada mudança.
  const bpmRef = React.useRef(bpm);
  const beatsRef = React.useRef(beatsPerMeasure);

  React.useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  React.useEffect(() => {
    beatsRef.current = beatsPerMeasure;
  }, [beatsPerMeasure]);

  // O BPM do arranjo pode mudar (troca de versão/override) enquanto parado.
  React.useEffect(() => {
    if (!playing) {
      setBpm(Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(initialBpm))));
    }
  }, [initialBpm, playing]);

  /** Um clique curto: nota mais aguda no tempo 1, mais grave nos demais. */
  const click = React.useCallback((ctx: AudioContext, time: number, accent: boolean) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = accent ? 1600 : 900;
    gain.gain.setValueAtTime(accent ? 0.5 : 0.32, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.06);
  }, []);

  const stop = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    queueRef.current = [];
    setPlaying(false);
    setBeat(-1);
  }, []);

  const start = React.useCallback(async () => {
    if (!audioRef.current) {
      audioRef.current = new AudioContext();
    }
    const ctx = audioRef.current;
    // Navegadores só liberam áudio após um gesto do usuário.
    if (ctx.state === "suspended") await ctx.resume();

    beatRef.current = 0;
    queueRef.current = [];
    nextTimeRef.current = ctx.currentTime + 0.05;

    timerRef.current = window.setInterval(() => {
      while (nextTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_S) {
        const current = beatRef.current;
        click(ctx, nextTimeRef.current, current === 0);
        queueRef.current.push({ beat: current, time: nextTimeRef.current });
        nextTimeRef.current += 60 / bpmRef.current;
        beatRef.current = (current + 1) % Math.max(1, beatsRef.current);
      }
    }, LOOKAHEAD_MS);

    // Acende o ponto no compasso quando a batida agendada realmente toca.
    const draw = () => {
      const now = ctx.currentTime;
      const queue = queueRef.current;
      while (queue.length && queue[0].time <= now) {
        setBeat(queue[0].beat);
        queue.shift();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    setPlaying(true);
  }, [click]);

  // Solta o timer e o contexto de áudio ao desmontar.
  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      audioRef.current?.close().catch(() => {});
      audioRef.current = null;
    };
  }, []);

  const adjust = (delta: number) =>
    setBpm((v) => Math.min(MAX_BPM, Math.max(MIN_BPM, v + delta)));

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border bg-muted/30 p-3",
        className
      )}
    >
      <Button
        variant={playing ? "default" : "outline"}
        size="icon"
        onClick={() => (playing ? stop() : start())}
        aria-label={playing ? "Parar o clique" : "Tocar o clique"}
      >
        {playing ? (
          <Square className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => adjust(-1)}
          aria-label="Diminuir o BPM"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="min-w-[4.5rem] text-center font-mono text-sm font-medium tabular-nums">
          {bpm} bpm
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => adjust(1)}
          aria-label="Aumentar o BPM"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Pontos do compasso — o primeiro é o acento. */}
      <div className="flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: beatsPerMeasure }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              beat === i
                ? i === 0
                  ? "bg-primary"
                  : "bg-primary/60"
                : "bg-muted-foreground/25"
            )}
          />
        ))}
      </div>

      <span className="ml-auto text-xs text-muted-foreground">
        Clique automático
      </span>
    </div>
  );
}
