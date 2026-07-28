import { Camera, Lightbulb, Music2, Radio, SlidersHorizontal, Video } from "lucide-react";

interface SvgProps {
  className?: string;
}

/* Conjunto de ícones preenchidos (estilo Material) — mesmos do catálogo. */

function Mic({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3m7 9c0 3.53-2.61 6.44-6 6.93V21h-2v-3.07c-3.39-.49-6-3.4-6-6.93h2a5 5 0 0 0 5 5a5 5 0 0 0 5-5z" />
    </svg>
  );
}

function Drum({ className }: SvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="m2 2l8 8m12-8l-8 8" />
      <ellipse cx="12" cy="9" rx="10" ry="5" />
      <path d="M7 13.4v7.9m5-7.3v8m5-8.6v7.9M2 9v8a10 5 0 0 0 20 0V9" />
    </svg>
  );
}

/** Violão / acústico (guitar-acoustic). */
function Violao({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 3H22v2h-1.59l-4.24 4.24c-.37-.56-.85-1.04-1.41-1.41zM12 8a4 4 0 0 1 4 4a3.99 3.99 0 0 1-3 3.87V16a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5h.13c.45-1.76 2.04-3 3.87-3m0 2.5a1.5 1.5 0 0 0-1.5 1.5a1.5 1.5 0 0 0 1.5 1.5a1.5 1.5 0 0 0 1.5-1.5a1.5 1.5 0 0 0-1.5-1.5m-5.06 3.74l-.71.7l2.83 2.83l.71-.71z" />
    </svg>
  );
}

/** Guitarra / elétrica (guitar-electric). */
function Guitarra({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 3H22v2h-1.59l-5.29 5.29l-1.41-1.39zM12 9c.26 0 .5.1.71.3l2 2c.18.2.29.43.29.7l-.1.4l-4 8c-.19.35-.54.53-.9.53c-.35 0-.71-.18-.89-.53l-1.86-3.7l-3.7-1.8c-.37-.2-.55-.55-.55-.9s.18-.7.55-.9l8-4c.14-.1.29-.1.45-.1m-2.65 2.82l-.7.68l2.85 2.85l.68-.7zm-1.41 1.41l-.71.71l2.83 2.83l.71-.71z" />
    </svg>
  );
}

function Piano({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v16a2 2 0 0 0 2 2h16c1.11 0 2-.89 2-2V4a2 2 0 0 0-2-2m-5.26 12H15v6H9v-6h.31c.55 0 .99-.44.99-1V4h3.45v9c0 .56.44 1 .99 1M4 4h2.8v9c0 .56.44 1 .99 1H8v6H4zm16 16h-4v-6h.26c.55 0 .99-.44.99-1V4H20z" />
    </svg>
  );
}

/** Contrabaixo / baixo (guitar-bass). */
function Baixo({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor">
      <path d="M228.2 26.89c-15.2-.25-27.7 33.46-12.3 39.8l8.9 3.61l17.8-15.5l-1.8-23.5l-8.7-3.6c-1.1-.43-2.1-.68-3.2-.78h-.7zm134.4 7.92h-2.3c-7.4.3-15.3 2.12-23.3 5.75c-21.2 9.67-43.6 32.67-59.7 75.74L174.4 394.7l-.1.2v.2c.9.5 3.6 1.9 8 4c9.8 4.8 24 15.7 26.1 38.8v.5l-1 55.6H304c-.1-17.6 1.4-34.5 8.1-51.5c11.7-29.4 39.3-54.9 97-77c0-.2 0 0 .1-.4c.3-2 .4-6 0-11c-1-10.1-4-24.9-8.6-42.2c-9.2-34.7-24.8-80.2-42.4-124.9l-2.4-6.2l5.2-4.2c36.1-28.2 51.1-56.4 53.8-79.56c2.7-23.06-6.5-41.48-21.3-52.25c-8.7-6.31-19.3-9.99-30.9-10.02zM260.5 52.44l.7 10.01l-7.6 6.6l21.7 8.93c1.2-2.17 2.5-4.28 3.8-6.33l4-9.89zm69 18.56c8.8 0 16 7.16 16 16s-7.2 16-16 16s-16-7.16-16-16s7.2-16 16-16m-136.7 49.7c-15.2-.3-27.9 33.4-12.3 39.8l8.8 3.6l17.8-15.5l-1.7-23.6l-8.8-3.6c-1.1-.4-2.1-.6-3.1-.7zm32.2 25.5l.7 10l-7.6 6.6l19.9 8.1l6.2-16.8zm71.6 19.8c8.8 0 16 7.2 16 16s-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16m-139.8 50.6c-15.3-.3-27.8 33.4-12.4 39.8l8.9 3.6l17.8-15.5l-1.8-23.6l-8.7-3.6c-1.1-.4-2.1-.6-3.1-.7zm32.2 25.5l.7 10l-7.6 6.6l20.4 8.3l6.2-16.8zm67.2 19.3c8.8 0 16 7.2 16 16s-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16m-140.1 54.4c-15.2-.3-27.78 33.4-12.3 39.8l8.8 3.6l17.8-15.5l-1.8-23.6l-8.7-3.6c-1.1-.4-2.1-.6-3.1-.7zm32.2 25.5l.7 10l-7.6 6.6l22.8 9.3l6.8-16.6zm69.3 18.5c8.8 0 16 7.2 16 16s-7.2 16-16 16s-16-7.2-16-16s7.2-16 16-16" />
    </svg>
  );
}

function Violino({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 2a1 1 0 0 0-1 1v6a.5.5 0 0 0 .5.5H12a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5h-1.5C9.73 10.5 9 9.77 9 9V5.16C7.27 5.6 6 7.13 6 9v1.5A2.5 2.5 0 0 1 8.5 13A2.5 2.5 0 0 1 6 15.5V17c0 2.77 2.23 5 5 5h2c2.77 0 5-2.23 5-5v-1.5a2.5 2.5 0 0 1-2.5-2.5a2.5 2.5 0 0 1 2.5-2.5V9c0-2.22-1.78-4-4-4V3a1 1 0 0 0-1-1zm-.25 14.5h2.5l-.5 3.5h-1.5z" />
    </svg>
  );
}

function Sax({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 2a1 1 0 0 0-1 1a1 1 0 0 0 1 1a3 3 0 0 1 3 3v8.5c0 3.6 2.9 6.5 6.5 6.5s6.5-2.9 6.5-6.5V13a1 1 0 0 0 1-1a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1a1 1 0 0 0 1 1v2a1 1 0 0 1-1 1a1 1 0 0 1-1-1v-4a1 1 0 0 0 1-1a1 1 0 0 0-1-1V8a1 1 0 0 0 1-1a1 1 0 0 0-1-1v-.5A3.5 3.5 0 0 0 8.5 2z" />
    </svg>
  );
}

function Trumpet({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 6c-1 5-7 5-7 5H4c-1 0-2-1-2-1H1v4h1s1-1 2-1h.3c-.2.3-.3.6-.3 1v2c0 1.1.9 2 2 2h1v1h2v-1h1v1h2v-1h1v1h2v-1h1c1.1 0 2-.9 2-2v-2c0-.1 0-.3-.1-.4c1.7.6 3.5 1.8 4.1 4.4h1V6zM6 16.5c-.3 0-.5-.2-.5-.5v-2c0-.3.2-.5.5-.5h1v3zm3 0v-3h1v3zm3 0v-3h1v3zm4.5-.5c0 .3-.2.5-.5.5h-1v-3h1c.3 0 .5.2.5.5zM9 10H7V9h2zm3 0h-2V9h2zm3 0h-2V9h2z" />
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
      if (/teclado|piano|[óo]rg[ãa]o|acorde/.test(n)) return Piano;
      if (/guitarra/.test(n)) return Guitarra;
      return Violao; // violão, ukulele, cavaco…
    case "CORDAS":
      if (/guitarra/.test(n)) return Guitarra;
      if (/baixo|contrabaixo/.test(n)) return Baixo;
      return Violino;
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
  if (/baixo|contrabaixo/.test(n)) return Baixo;
  if (/viol[ãa]o|ukulele|cavaco/.test(n)) return Violao;
  if (/violino|viola|violoncelo/.test(n)) return Violino;
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
