"use client";

import * as React from "react";
import { Loader2, Mic, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { detectPitch, frequencyToNote } from "@/lib/pitch";
import { midiToLabel, midiToNamePt, midiToOctave } from "@/lib/vocal-range";

const FFT_SIZE = 4096;
const UPDATE_MS = 66;
/** Leituras seguidas na mesma nota antes de aceitá-la. */
const STABLE_READINGS = 4;

type Target = "low" | "high";
type Status = "idle" | "listening" | "denied" | "error";

interface VocalRangeCaptureProps {
  low: number | null;
  high: number | null;
  onChange: (next: { low: number | null; high: number | null }) => void;
  /**
   * "voice" grava a extensão do cantor; "melody" grava a extensão da
   * melodia da música. A mecânica é a mesma; muda a orientação.
   */
  variant?: "voice" | "melody";
  className?: string;
}

const COPY = {
  voice: {
    title: "Extensão vocal",
    hint: (
      <>
        Cante a nota mais grave e a mais aguda que você faz{" "}
        <strong className="text-foreground">com conforto</strong> — não o
        limite máximo. O app usa isso para sugerir o tom de cada música.
      </>
    ),
    lowLabel: "Nota mais grave",
    highLabel: "Nota mais aguda",
    instruction: (which: Target) =>
      which === "low" ? "mais grave" : "mais aguda",
  },
  melody: {
    title: "Extensão da melodia",
    hint: (
      <>
        Cante (ou toque) o trecho{" "}
        <strong className="text-foreground">mais grave</strong> e o{" "}
        <strong className="text-foreground">mais agudo</strong> da melodia,
        no tom em que esta versão está. Com isso o app sugere o melhor tom
        para cada cantor.
      </>
    ),
    lowLabel: "Nota mais grave da melodia",
    highLabel: "Nota mais aguda da melodia",
    instruction: (which: Target) =>
      which === "low" ? "mais grave da melodia" : "mais aguda da melodia",
  },
} as const;

/**
 * Captura a extensão vocal cantando: o músico segura a nota mais grave
 * que faz confortável, depois a mais aguda. Nada de teoria musical —
 * ele canta e o app nomeia a nota.
 */
export function VocalRangeCapture({
  low,
  high,
  onChange,
  variant = "voice",
  className,
}: VocalRangeCaptureProps) {
  const copy = COPY[variant];
  const [status, setStatus] = React.useState<Status>("idle");
  const [target, setTarget] = React.useState<Target | null>(null);
  const [current, setCurrent] = React.useState<number | null>(null);

  const streamRef = React.useRef<MediaStream | null>(null);
  const contextRef = React.useRef<AudioContext | null>(null);
  const timerRef = React.useRef<number | null>(null);
  const stableRef = React.useRef<number[]>([]);

  const stop = React.useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    contextRef.current?.close().catch(() => {});
    contextRef.current = null;
    stableRef.current = [];
    setStatus("idle");
    setTarget(null);
    setCurrent(null);
  }, []);

  React.useEffect(() => stop, [stop]);

  async function listen(which: Target) {
    setTarget(which);
    stableRef.current = [];
    if (status === "listening") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
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
        const note = frequency ? frequencyToNote(frequency) : null;

        if (!note) {
          stableRef.current = [];
          setCurrent(null);
          return;
        }

        setCurrent(note.midi);

        // Só aceita depois de a mesma nota se repetir: evita registrar
        // um estalo ou o começo instável da voz.
        const stable = stableRef.current;
        stable.push(note.midi);
        if (stable.length > STABLE_READINGS) stable.shift();
        if (
          stable.length === STABLE_READINGS &&
          stable.every((m) => m === stable[0])
        ) {
          setTargetValue(which, stable[0]);
          stableRef.current = [];
        }
      }, UPDATE_MS);
    } catch (error) {
      const denied =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError");
      setStatus(denied ? "denied" : "error");
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function setTargetValue(which: Target, midi: number) {
    if (which === "low") {
      // Mantém a extensão coerente: o grave não passa do agudo.
      onChange({ low: midi, high: high !== null && high < midi ? midi : high });
    } else {
      onChange({ low: low !== null && low > midi ? midi : low, high: midi });
    }
  }

  const span = low !== null && high !== null ? high - low : null;

  return (
    <div className={cn("space-y-3 rounded-xl border bg-muted/30 p-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {copy.title}
        </span>
        {span !== null ? (
          <span className="text-xs text-muted-foreground">
            {span} semitons ({(span / 12).toFixed(1)} oitavas)
          </span>
        ) : null}
        {status === "listening" ? (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={stop}
          >
            <Square className="h-3.5 w-3.5" /> Parar
          </Button>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {(["low", "high"] as const).map((which) => {
          const value = which === "low" ? low : high;
          const active = status === "listening" && target === which;
          return (
            <div
              key={which}
              className={cn(
                "rounded-lg border p-2.5 transition-colors",
                active && "border-primary bg-primary/5"
              )}
            >
              <p className="text-xs text-muted-foreground">
                {which === "low" ? copy.lowLabel : copy.highLabel}
              </p>
              <p className="mt-0.5 font-mono text-lg font-semibold leading-tight">
                {value !== null ? midiToLabel(value) : "—"}
                {value !== null ? (
                  <span className="ml-1.5 font-sans text-xs font-normal text-muted-foreground">
                    {midiToNamePt(value)} {midiToOctave(value)}
                  </span>
                ) : null}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => listen(which)}
                >
                  {active ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Mic className="h-3 w-3" />
                  )}
                  {active ? "Cantando…" : "Cantar"}
                </Button>
                {value !== null ? (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-danger"
                    onClick={() =>
                      onChange({
                        low: which === "low" ? null : low,
                        high: which === "high" ? null : high,
                      })
                    }
                  >
                    limpar
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {status === "listening" ? (
        <p className="text-xs text-muted-foreground">
          Segure a nota{" "}
          <strong className="text-foreground">
            {copy.instruction(target ?? "low")}
          </strong>
          .
          {current !== null ? (
            <>
              {" "}
              Ouvindo:{" "}
              <span className="font-mono text-foreground">
                {midiToLabel(current)}
              </span>
            </>
          ) : null}
        </p>
      ) : status === "denied" ? (
        <p className="text-xs text-muted-foreground">
          Permita o acesso ao microfone para gravar cantando — ou informe as
          notas manualmente com a equipe.
        </p>
      ) : status === "error" ? (
        <p className="text-xs text-muted-foreground">
          Não foi possível abrir o microfone neste aparelho.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">{copy.hint}</p>
      )}
    </div>
  );
}
