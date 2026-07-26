import {
  Camera,
  Drum,
  Guitar,
  Lightbulb,
  Mic,
  Music2,
  Piano,
  Radio,
  SlidersHorizontal,
  Video,
} from "lucide-react";

interface SvgProps {
  className?: string;
}

/* Ícones que o lucide não traz — desenhados à mão (sopros e cordas). */
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
      return Mic;
    case "RITMO":
    case "PERCUSSAO_ORQUESTRAL":
      return Drum;
    case "HARMONIA":
      return /teclado|piano|[óo]rg[ãa]o|acorde/.test(n) ? Piano : Guitar;
    case "CORDAS":
      return /contrabaixo el|baixo|guitarra/.test(n) ? Guitar : Violin;
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
  if (/viol[ãa]o|guitarra|ukulele|cavaco/.test(n)) return Guitar;
  if (/teclado|piano|[óo]rg[ãa]o|acorde/.test(n)) return Piano;
  if (/vocal|soprano|contralto|tenor|ministro|voz|backing/.test(n)) return Mic;
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
