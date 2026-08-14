/**
 * Transposição de cifras digitadas pela própria igreja.
 *
 * Trabalha com a notação de letras (C, D, E…), que é a usada nas cifras
 * brasileiras. Reconhece dois formatos, os mesmos que as pessoas já colam:
 *
 *   1. Acordes acima da letra (linha só de acordes seguida da linha cantada)
 *   2. ChordPro, com o acorde entre colchetes no meio da letra ([G]palavra)
 *
 * A transposição preserva o alinhamento das colunas: se um acorde encolhe
 * ou cresce ao mudar de tom, o espaçamento é reajustado para o acorde
 * continuar sobre a sílaba certa.
 */

const SHARP_NOTES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];
const FLAT_NOTES = [
  "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B",
];

const NOTE_INDEX: Record<string, number> = {
  C: 0, "B#": 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, Fb: 4,
  "E#": 5, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10,
  Bb: 10, B: 11, Cb: 11,
};

/** Raiz + complemento + baixo opcional (ex.: "C#m7/G#"). */
const CHORD_RE = /^([A-G][#b]?)([^\s/]*)(?:\/([A-G][#b]?))?$/;

/**
 * Complementos aceitos (m, 7, sus4, add9, dim, º…). Serve para não
 * confundir palavra da letra com acorde: "Deus" cai fora porque "e" não
 * entra aqui, enquanto "Em" e "C#m7" passam.
 */
const SUFFIX_RE = /^(?:maj|Maj|MAJ|min|Min|m|M|dim|aug|sus|add|alt|no|º|°|ø|Δ|\+|-|#|b|\(|\)|,|\d)*$/;

/** O token é um acorde? (raiz válida e complemento reconhecido) */
export function isChordToken(token: string): boolean {
  const match = CHORD_RE.exec(token);
  if (!match) return false;
  return SUFFIX_RE.test(match[2]);
}

/**
 * Rótulo de trecho no meio da linha de acordes — "Intro:", "[Refrão]",
 * "(2x)". Aparece muito nas cifras coladas e não deve ser transposto.
 */
function isLabelToken(token: string): boolean {
  return (
    token.endsWith(":") ||
    /^\[.*\]$/.test(token) ||
    /^\(.*\)$/.test(token) ||
    /^\d+x$/i.test(token)
  );
}

/**
 * A linha é uma linha de acordes? Precisa ter ao menos um acorde e nada
 * além de acordes e rótulos. Assim "Intro: C G Am F" entra, e um verso
 * não entra só porque contém "Em" ou "A".
 */
export function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  let chords = 0;
  for (const token of tokens) {
    if (isChordToken(token)) chords++;
    else if (!isLabelToken(token)) return false;
  }
  return chords > 0;
}

/** Sobe (ou desce) um acorde em N semitons. */
export function transposeChord(
  chord: string,
  semitones: number,
  preferFlats = false
): string {
  const match = CHORD_RE.exec(chord);
  if (!match || !SUFFIX_RE.test(match[2])) return chord;

  const [, root, suffix, bass] = match;
  const scale = preferFlats ? FLAT_NOTES : SHARP_NOTES;

  const shift = (note: string) => {
    const index = NOTE_INDEX[note];
    if (index === undefined) return note;
    return scale[(((index + semitones) % 12) + 12) % 12];
  };

  return shift(root) + suffix + (bass ? `/${shift(bass)}` : "");
}

/**
 * Transpõe uma linha de acordes mantendo cada acorde na mesma coluna.
 * Quando o acorde novo é mais curto, completa com espaço; quando é mais
 * longo, empurra o mínimo necessário (sem nunca colar dois acordes).
 */
function transposeChordLine(
  line: string,
  semitones: number,
  preferFlats: boolean
): string {
  let result = "";
  // Percorre alternando espaços e tokens para preservar as posições.
  const parts = line.match(/\s+|\S+/g) ?? [];
  let column = 0;

  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      result += part;
      column += part.length;
      continue;
    }
    const target = column; // coluna onde o acorde deveria começar
    if (result.length < target) result += " ".repeat(target - result.length);
    // Rótulos ("Intro:", "2x") passam intactos.
    result += isLabelToken(part)
      ? part
      : transposeChord(part, semitones, preferFlats);
    column += part.length;
  }

  return result.replace(/\s+$/, "");
}

/**
 * A linha é ChordPro? Só quando o colchete traz mesmo um acorde — assim
 * "[Intro] C G Am F" segue como linha de acordes com rótulo.
 */
function hasInlineChords(line: string): boolean {
  const matches = line.match(/\[([^\]]+)\]/g);
  if (!matches) return false;
  return matches.some((m) => isChordToken(m.slice(1, -1)));
}

/** Transpõe os acordes entre colchetes de uma linha ChordPro. */
function transposeInline(
  line: string,
  semitones: number,
  preferFlats: boolean
): string {
  return line.replace(/\[([^\]]+)\]/g, (whole, chord: string) =>
    isChordToken(chord)
      ? `[${transposeChord(chord, semitones, preferFlats)}]`
      : whole
  );
}

/** Transpõe a cifra inteira, nos dois formatos. */
export function transposeChart(
  text: string,
  semitones: number,
  preferFlats = false
): string {
  if (!text) return text;
  const normalized = ((semitones % 12) + 12) % 12;
  if (normalized === 0) return text;

  return text
    .split("\n")
    .map((line) => {
      if (hasInlineChords(line)) {
        return transposeInline(line, semitones, preferFlats);
      }
      if (isChordLine(line)) {
        return transposeChordLine(line, semitones, preferFlats);
      }
      return line;
    })
    .join("\n");
}

/** Nome do tom depois de transpor (para mostrar ao músico). */
export function transposeKey(
  key: string | null | undefined,
  semitones: number,
  preferFlats = false
): string | null {
  if (!key) return null;
  const trimmed = key.trim();
  if (!trimmed) return null;
  const transposed = transposeChord(trimmed, semitones, preferFlats);
  return transposed === trimmed && semitones % 12 !== 0 ? null : transposed;
}

export interface ChartLine {
  kind: "chord" | "lyric" | "blank";
  text: string;
}

/**
 * Prepara a cifra para exibição: separa cada linha em acorde ou letra, e
 * converte ChordPro em par (linha de acordes / linha cantada) para o
 * acorde aparecer acima da sílaba certa.
 */
export function toDisplayLines(text: string): ChartLine[] {
  const lines: ChartLine[] = [];

  for (const line of text.split("\n")) {
    if (!line.trim()) {
      lines.push({ kind: "blank", text: "" });
      continue;
    }

    if (hasInlineChords(line)) {
      let chords = "";
      let lyrics = "";
      // Vai montando as duas linhas em paralelo, alinhadas por coluna.
      for (const part of line.split(/(\[[^\]]+\])/g)) {
        if (!part) continue;
        if (part.startsWith("[") && part.endsWith("]")) {
          const chord = part.slice(1, -1);
          if (chords.length < lyrics.length) {
            chords += " ".repeat(lyrics.length - chords.length);
          }
          chords += `${chord} `;
          continue;
        }
        if (lyrics.length < chords.length) {
          lyrics += " ".repeat(chords.length - lyrics.length);
        }
        lyrics += part;
      }
      if (chords.trim()) lines.push({ kind: "chord", text: chords.replace(/\s+$/, "") });
      if (lyrics.trim()) lines.push({ kind: "lyric", text: lyrics.replace(/\s+$/, "") });
      continue;
    }

    lines.push({ kind: isChordLine(line) ? "chord" : "lyric", text: line });
  }

  return lines;
}
