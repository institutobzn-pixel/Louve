"use client";

import * as React from "react";
import {
  ChevronsDown,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toDisplayLines, transposeChart, transposeKey } from "@/lib/chords";

interface ChordChartProps {
  /** Cifra digitada pela igreja (acordes acima da letra ou ChordPro). */
  text: string;
  /** Tom em que a cifra foi escrita, para mostrar o tom atual. */
  originalKey?: string | null;
  /** Duração da música em segundos — calibra a rolagem automática. */
  durationSec?: number | null;
  className?: string;
}

/** Altura da janela de leitura quando a rolagem automática está ligada. */
const SCROLL_VIEW_HEIGHT = 340;
/** Velocidade padrão (px/s) quando não há duração cadastrada. */
const DEFAULT_SPEED = 18;

/**
 * Cifra com transposição na hora e rolagem automática. O músico sobe ou
 * desce o tom e deixa a cifra descer sozinha, sem tirar a mão do
 * instrumento. Nada disso altera o que está salvo.
 */
export function ChordChart({
  text,
  originalKey,
  durationSec,
  className,
}: ChordChartProps) {
  const [semitones, setSemitones] = React.useState(0);

  // Acima de 6 semitons, bemol lê melhor que sustenido (Db em vez de C#).
  const preferFlats = semitones > 6 || semitones < -6;

  const lines = React.useMemo(
    () => toDisplayLines(transposeChart(text, semitones, preferFlats)),
    [text, semitones, preferFlats]
  );

  const currentKey = transposeKey(originalKey, semitones, preferFlats);
  const shift = (delta: number) =>
    setSemitones((v) => Math.max(-11, Math.min(11, v + delta)));

  /* ---------- Rolagem automática ---------- */

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  // Sobra fracionária de pixel entre quadros (a rolagem é em inteiros).
  const restRef = React.useRef(0);
  const speedRef = React.useRef(DEFAULT_SPEED);
  const [scrolling, setScrolling] = React.useState(false);
  // 1 = velocidade calibrada; o músico ajusta se estiver adiantado.
  const [rate, setRate] = React.useState(1);

  const stopScroll = React.useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    restRef.current = 0;
    setScrolling(false);
  }, []);

  /**
   * Com a duração cadastrada, a cifra inteira desce no tempo da música.
   * Sem ela, usa uma velocidade de leitura confortável.
   */
  const baseSpeed = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return DEFAULT_SPEED;
    const distance = el.scrollHeight - el.clientHeight;
    if (distance <= 0) return DEFAULT_SPEED;
    if (!durationSec || durationSec <= 0) return DEFAULT_SPEED;
    return distance / durationSec;
  }, [durationSec]);

  // Lido dentro do laço de animação sem reiniciá-lo a cada ajuste.
  const rateRef = React.useRef(rate);
  React.useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  /**
   * O laço só começa depois que a janela de leitura encolheu, senão a
   * medição da distância sairia zerada e a calibragem seria perdida.
   */
  React.useEffect(() => {
    if (!scrolling) return;
    const el = scrollRef.current;
    if (!el) return;

    speedRef.current = baseSpeed();
    restRef.current = 0;

    let previous = performance.now();
    const step = (now: number) => {
      const node = scrollRef.current;
      if (!node) return;
      const elapsed = (now - previous) / 1000;
      previous = now;

      restRef.current += speedRef.current * rateRef.current * elapsed;
      const pixels = Math.floor(restRef.current);
      if (pixels > 0) {
        restRef.current -= pixels;
        node.scrollTop += pixels;
      }

      // Chegou ao fim: para sozinho.
      if (node.scrollTop + node.clientHeight >= node.scrollHeight - 1) {
        stopScroll();
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [scrolling, baseSpeed, stopScroll]);

  // Transpor no meio da rolagem remonta as linhas: recomeça do topo.
  React.useEffect(() => {
    stopScroll();
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [semitones, stopScroll]);

  React.useEffect(() => stopScroll, [stopScroll]);

  return (
    <div className={cn("rounded-xl border", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          Cifra
        </span>

        {currentKey ? (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-medium text-primary">
            {currentKey}
          </span>
        ) : null}

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => shift(-1)}
            aria-label="Descer meio tom"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[3.25rem] text-center font-mono text-xs tabular-nums text-muted-foreground">
            {semitones > 0 ? `+${semitones}` : semitones}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => shift(1)}
            aria-label="Subir meio tom"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          {semitones !== 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSemitones(0)}
              aria-label="Voltar ao tom original"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : null}

          <span className="mx-1 h-5 w-px bg-border" aria-hidden />

          <Button
            variant={scrolling ? "default" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => (scrolling ? stopScroll() : setScrolling(true))}
            aria-label={
              scrolling ? "Parar a rolagem" : "Rolar a cifra automaticamente"
            }
            title="Rolagem automática"
          >
            {scrolling ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <ChevronsDown className="h-3.5 w-3.5" />
            )}
          </Button>

          {scrolling ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setRate((r) => Math.max(0.25, r - 0.15))}
                aria-label="Rolar mais devagar"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-[2.75rem] text-center font-mono text-xs tabular-nums text-muted-foreground">
                {rate.toFixed(1)}x
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setRate((r) => Math.min(4, r + 0.15))}
                aria-label="Rolar mais rápido"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Fonte monoespaçada mantém o acorde sobre a sílaba certa. */}
      <div
        ref={scrollRef}
        className={cn("overflow-x-auto p-3", scrolling && "overflow-y-auto")}
        style={scrolling ? { maxHeight: SCROLL_VIEW_HEIGHT } : undefined}
      >
        <pre className="font-mono text-[13px] leading-relaxed">
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                line.kind === "chord" && "font-semibold text-primary",
                line.kind === "blank" && "h-3"
              )}
            >
              {line.text || " "}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
