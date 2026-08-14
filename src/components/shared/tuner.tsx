"use client";

import * as React from "react";
import { Loader2, Mic, MicOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  detectPitch,
  frequencyToNote,
  IN_TUNE_CENTS,
  type NoteReading,
} from "@/lib/pitch";

/** Janela de áudio: grande o bastante para o Si grave do baixo (~31 Hz). */
const FFT_SIZE = 4096;
/** A detecção é pesada; 15 leituras por segundo já respondem de sobra. */
const UPDATE_MS = 66;
/** Leituras guardadas para a mediana (tira o tremor da agulha). */
const SMOOTHING = 5;
/** Fim da escala da agulha, em cents. */
const GAUGE_RANGE = 50;

type Status = "idle" | "starting" | "listening" | "denied" | "error";

/**
 * Afinador cromático. Ouve o microfone e mostra a nota e o quanto ela
 * está acima ou abaixo do tom. O microfone só é pedido quando o músico
 * aperta o botão, e é liberado ao parar.
 */
export function Tuner({ className }: { className?: string }) {
  const [status, setStatus] = React.useState<Status>("idle");
  const [note, setNote] = React.useState<NoteReading | null>(null);
  const [hz, setHz] = React.useState<number | null>(null);

  const streamRef = React.useRef<MediaStream | null>(null);
  const contextRef = React.useRef<AudioContext | null>(null);
  const timerRef = React.useRef<number | null>(null);
  const historyRef = React.useRef<number[]>([]);

  const stop = React.useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    contextRef.current?.close().catch(() => {});
    contextRef.current = null;
    historyRef.current = [];
    setNote(null);
    setHz(null);
    setStatus("idle");
  }, []);

  const start = React.useCallback(async () => {
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // Os tratamentos do navegador mexem no sinal e atrapalham a leitura.
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const context = new AudioContext();
      contextRef.current = context;
      if (context.state === "suspended") await context.resume();

      const analyser = context.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      context.createMediaStreamSource(stream).connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      setStatus("listening");

      timerRef.current = window.setInterval(() => {
        analyser.getFloatTimeDomainData(buffer);
        const frequency = detectPitch(buffer, context.sampleRate);

        if (frequency === null) {
          historyRef.current = [];
          setNote(null);
          setHz(null);
          return;
        }

        // Mediana das últimas leituras: uma leitura solta e errada não
        // faz a agulha pular.
        const history = historyRef.current;
        history.push(frequency);
        if (history.length > SMOOTHING) history.shift();
        const sorted = [...history].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];

        setHz(median);
        setNote(frequencyToNote(median));
      }, UPDATE_MS);
    } catch (error) {
      const denied =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError");
      setStatus(denied ? "denied" : "error");
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Libera o microfone se o músico sair da tela com o afinador ligado.
  React.useEffect(() => stop, [stop]);

  const cents = note?.cents ?? 0;
  const inTune = note !== null && Math.abs(cents) <= IN_TUNE_CENTS;
  const close = note !== null && Math.abs(cents) <= 15;
  // Posição da agulha, de 0% a 100%, com o centro afinado.
  const needle =
    50 + (Math.max(-GAUGE_RANGE, Math.min(GAUGE_RANGE, cents)) / GAUGE_RANGE) * 50;

  return (
    <div className={cn("rounded-xl border bg-muted/30 p-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          Afinador
        </span>

        <Button
          variant={status === "listening" ? "default" : "outline"}
          size="sm"
          className="ml-auto"
          onClick={() => (status === "listening" ? stop() : start())}
          disabled={status === "starting"}
        >
          {status === "starting" ? (
            <Loader2 className="animate-spin" />
          ) : status === "listening" ? (
            <MicOff />
          ) : (
            <Mic />
          )}
          {status === "listening" ? "Parar" : "Afinar"}
        </Button>
      </div>

      {status === "denied" ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Permita o acesso ao microfone no navegador para usar o afinador.
        </p>
      ) : null}

      {status === "error" ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Não foi possível abrir o microfone neste aparelho.
        </p>
      ) : null}

      {status === "listening" ? (
        <div className="mt-3">
          {/* Nota e desvio */}
          <div className="flex items-end justify-center gap-3">
            <span
              className={cn(
                "font-mono text-4xl font-bold leading-none tabular-nums transition-colors",
                note === null
                  ? "text-muted-foreground/40"
                  : inTune
                    ? "text-success"
                    : "text-foreground"
              )}
            >
              {note ? note.name : "–"}
            </span>
            {note ? (
              <span className="pb-1 text-sm text-muted-foreground">
                {note.namePt}
                <span className="ml-1 font-mono">{note.octave}</span>
              </span>
            ) : null}
          </div>

          {/* Agulha */}
          <div className="relative mt-3 h-9">
            <div className="absolute inset-x-0 top-4 h-1 rounded-full bg-muted-foreground/15" />
            {/* Faixa afinada, no centro */}
            <div
              className="absolute top-4 h-1 rounded-full bg-success/25"
              style={{
                left: `${50 - (IN_TUNE_CENTS / GAUGE_RANGE) * 50}%`,
                width: `${(IN_TUNE_CENTS / GAUGE_RANGE) * 100}%`,
              }}
            />
            <div className="absolute left-1/2 top-2 h-5 w-px -translate-x-1/2 bg-muted-foreground/50" />

            {note ? (
              <div
                className={cn(
                  "absolute top-1 h-7 w-1 -translate-x-1/2 rounded-full transition-all duration-100",
                  inTune
                    ? "bg-success"
                    : close
                      ? "bg-warning"
                      : "bg-danger"
                )}
                style={{ left: `${needle}%` }}
              />
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>♭ grave</span>
            <span className="font-mono tabular-nums">
              {note ? (
                <>
                  {cents > 0 ? "+" : ""}
                  {cents} cents
                  {hz ? ` · ${hz.toFixed(1)} Hz` : null}
                </>
              ) : (
                "toque uma nota"
              )}
            </span>
            <span>agudo ♯</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
