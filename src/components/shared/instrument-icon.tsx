import {
  Camera,
  Drum,
  Lightbulb,
  Music2,
  Piano,
  Radio,
  SlidersHorizontal,
  Video,
} from "lucide-react";

interface SvgProps {
  className?: string;
}

/* Ícones desenhados à mão — o lucide não traz bons equivalentes. */

/** Microfone retrô estilo Shure 55 ("Elvis"): cápsula com grelha e aro. */
function RetroMic({ className }: SvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="7.6" y="2.6" width="8.8" height="11" rx="4.4" />
      <path d="M9 6.2h6M9 8.4h6M9 10.6h6" />
      <path d="M5.8 9a6.2 6.2 0 0 0 12.4 0" />
      <path d="M12 15.2v3.4" />
      <path d="M9.2 18.7h5.6" />
    </svg>
  );
}

/** Violão / acústico: corpo redondo com boca, braço e cravelhas. */
function Violao({ className }: SvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.3 5.2V2.7h3.4v2.5" />
      <circle cx="10.4" cy="3.5" r=".5" fill="currentColor" stroke="none" />
      <circle cx="13.6" cy="3.5" r=".5" fill="currentColor" stroke="none" />
      <path d="M11.2 5.2v6M12.8 5.2v6" />
      <path d="M12 11c-3 0-5.2 2-5.2 4.8 0 2.9 2.3 5 5.2 5s5.2-2.1 5.2-5C17.2 13 15 11 12 11Z" />
      <circle cx="12" cy="15.4" r="1.7" />
      <path d="M9.9 18.2h4.2" />
    </svg>
  );
}

/** Guitarra elétrica: corpo com recortes (Strat) na diagonal. */
function Guitarra({ className }: SvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3.7 9.5 9.2" />
      <path
        d="M14.3 2.2c.6-.6 1.7-.6 2.3 0 .6.6.6 1.7 0 2.3-.4.4-1.1.4-1.1.4s0-.7.4-1.1c.3-.3 0-.9-.5-.8-.5 0-.9.4-.9.9Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M10.6 8c-1.3-1.3-3.1-.7-4 .2-1 1-.6 2.3-1.6 3.3-1.2 1.2-3.2 1-3.2 3 0 1.6 1.8 3.4 3.4 3.4 2 0 1.8-2 3-3.2 1-1 2.3-.6 3.3-1.6.9-.9 1.5-2.7.2-4Z" />
      <path d="M6.1 12 7.9 13.8" />
    </svg>
  );
}

function Sax({ className }: SvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 3v7a5 5 0 0 0 5 5h1.5a2.5 2.5 0 0 0 2.5-2.5" />
      <path d="M18 11.5l2.5 2-2.5 2" />
      <path d="M9 6h.01M9 8.4h.01M9 10.8h.01" />
    </svg>
  );
}

function Trumpet({ className }: SvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 11h13" />
      <path d="M15 7.5c2.2 0 4 1.6 4 3.5s-1.8 3.5-4 3.5" />
      <path d="M18.5 8l3.5-1.2v8.4L18.5 14" />
      <path d="M6 11V8M9 11V8M12 11V8" />
    </svg>
  );
}

function Violin({ className }: SvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 3.2c1.1 1.1 1.1 2.3-.6 3.8" />
      <path d="M15.6 4.4 8 12" />
      <path d="M10 12.4c-2.1 0-3.5 1.5-3.5 3.3 0 1.8 1.5 3.3 3.4 3.3 1.8 0 3.3-1.4 3.1-3.2" />
      <path d="m9.4 12.9 3.2 3.2" />
    </svg>
  );
}

/**
 * Retorna o ícone que representa o instrumento/função. A categoria é o sinal
 * principal (confiável); o nome refina dentro de categorias mistas (Harmonia,
 * Cordas, Produção). Cai em uma nota musical se nada casar.
 */
function pickIcon(name?: string, categoryKey?: string) {
  const n = (name ?? "").toLowerCase();

  switch (categoryKey) {
    case "LIDERANCA":
    case "VOZ":
      return RetroMic;
    case "RITMO":
    case "PERCUSSAO_ORQUESTRAL":
      return Drum;
    case "HARMONIA":
      if (/teclado|piano|[óo]rg[ãa]o|acorde/.test(n)) return Piano;
      if (/guitarra/.test(n)) return Guitarra;
      return Violao; // violão, ukulele, cavaco…
    case "CORDAS":
      if (/guitarra/.test(n)) return Guitarra;
      if (/baixo|contrabaixo el/.test(n)) return Guitarra;
      return Violin;
    case "SOPROS_MADEIRA":
      return Sax;
    case "SOPROS_METAIS":
      return Trumpet;
    case "PRODUCAO":
      if (/som|[áa]udio|mix/.test(n)) return SlidersHorizontal;
      if (/transmiss|streaming/.test(n)) return Radio;
      if (/ilumina/.test(n)) return Lightbulb;
      if (/foto/.test(n)) return Camera;
      if (/v[íi]deo/.test(n)) return Video;
      return SlidersHorizontal;
  }

  // Sem categoria — deduz pelo nome.
  if (/bateria|percuss|cajon|pandeiro|tambor/.test(n)) return Drum;
  if (/guitarra/.test(n)) return Guitarra;
  if (/viol[ãa]o|ukulele|cavaco/.test(n)) return Violao;
  if (/teclado|piano|[óo]rg[ãa]o|acorde/.test(n)) return Piano;
  if (/vocal|soprano|contralto|tenor|ministro|voz|backing/.test(n)) {
    return RetroMic;
  }
  return Music2;
}

/** Ícone vetorizado do instrumento (para a escala, equipe, etc.). */
export function InstrumentIcon({
  name,
  categoryKey,
  className,
}: {
  name?: string;
  categoryKey?: string;
  className?: string;
}) {
  const Icon = pickIcon(name, categoryKey);
  return <Icon className={className} />;
}
