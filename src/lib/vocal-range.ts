/**
 * Escolha do tom a partir da voz do cantor.
 *
 * O cantor grava a extensão confortável dele e a versão guarda a extensão
 * da melodia. Daí sai, por aritmética de semitons, em que tom a música
 * cabe na voz da pessoa — sem ela precisar saber teoria musical.
 *
 * As notas são guardadas como número MIDI (60 = Dó central, 69 = Lá 440).
 */

const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];
const NOTE_NAMES_PT = [
  "Dó", "Dó#", "Ré", "Ré#", "Mi", "Fá", "Fá#", "Sol", "Sol#", "Lá", "Lá#", "Si",
];

/**
 * Teto prático para a congregação acompanhar. Acima disso a melodia sai
 * da faixa confortável da média das pessoas e a igreja para de cantar.
 * Lá4 (MIDI 69) é o limite usual citado por quem dirige louvor.
 */
export const CONGREGATION_CEILING = 69;
/** Piso: abaixo daqui as vozes mais graves somem. */
export const CONGREGATION_FLOOR = 55;

export function midiToName(midi: number) {
  const index = ((Math.round(midi) % 12) + 12) % 12;
  return NOTE_NAMES[index];
}

export function midiToNamePt(midi: number) {
  const index = ((Math.round(midi) % 12) + 12) % 12;
  return NOTE_NAMES_PT[index];
}

export function midiToOctave(midi: number) {
  return Math.floor(Math.round(midi) / 12) - 1;
}

/** Rótulo completo da nota (ex.: "A3 · Lá 3"). */
export function midiToLabel(midi: number) {
  const rounded = Math.round(midi);
  return `${midiToName(rounded)}${midiToOctave(rounded)}`;
}

export interface KeySuggestion {
  /** Semitons a transpor a partir do tom cadastrado. */
  semitones: number;
  /** Nome do tom resultante, quando o tom de origem é conhecido. */
  keyName: string | null;
  /** A melodia inteira cabe na extensão confortável do cantor. */
  fits: boolean;
  /** Semitons de folga até o limite agudo (negativo = estourou). */
  headroom: number;
  /** Semitons de folga até o limite grave (negativo = estourou). */
  legroom: number;
  /** A melodia passa do teto em que a congregação acompanha. */
  aboveCongregation: boolean;
  /** Nota mais aguda da melodia neste tom. */
  highNote: number;
  /** Nota mais grave da melodia neste tom. */
  lowNote: number;
  /**
   * Oitavas que o cantor desloca para caber (−1 = uma oitava abaixo).
   * Não muda o tom que a banda toca: é a oitava em que se canta.
   */
  octaveShift: number;
}

export interface SuggestKeysInput {
  /** Extensão da melodia no tom em que a versão foi cadastrada. */
  melodyLow: number;
  melodyHigh: number;
  /** Extensão confortável do cantor. */
  vocalLow: number;
  vocalHigh: number;
  /** Tom cadastrado da versão (ex.: "G"), para nomear o resultado. */
  originalKey?: string | null;
}

/** Converte o nome do tom em número da nota (0–11), ou null. */
function keyToPitchClass(key: string): number | null {
  const match = /^([A-G])([#b]?)/.exec(key.trim());
  if (!match) return null;
  const base: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  };
  let value = base[match[1]];
  if (value === undefined) return null;
  if (match[2] === "#") value += 1;
  if (match[2] === "b") value -= 1;
  return ((value % 12) + 12) % 12;
}

/** Nome do tom depois de transpor, preservando menor ("m") se houver. */
function transposeKeyName(key: string, semitones: number): string | null {
  const pitchClass = keyToPitchClass(key);
  if (pitchClass === null) return null;
  const minor = /m(?!aj)/.test(key.trim().slice(1)) ? "m" : "";
  return NOTE_NAMES[((pitchClass + semitones) % 12 + 12) % 12] + minor;
}

/**
 * Avalia os 12 tons e devolve todos, do melhor para o pior.
 *
 * Duas coisas são separadas de propósito:
 *
 * - **O tom** (12 opções) é o que a banda toca e o que muda na cifra.
 * - **A oitava** é escolha natural do cantor: um barítono canta a mesma
 *   melodia uma oitava abaixo sem que nada mude no arranjo.
 *
 * Por isso cada tom é testado em várias oitavas, e fica a que melhor
 * acomoda a voz. O critério não é só "cabe": é **onde cabe** — cantar
 * colado no teto cansa, então tons que deixam a melodia centralizada
 * na voz vêm primeiro.
 */
export function suggestKeys(input: SuggestKeysInput): KeySuggestion[] {
  const { melodyLow, melodyHigh, vocalLow, vocalHigh, originalKey } = input;

  const results: KeySuggestion[] = [];

  for (let semitones = -6; semitones <= 5; semitones++) {
    let bestForKey: KeySuggestion | null = null;

    for (const octaveShift of [-2, -1, 0, 1, 2]) {
      const offset = semitones + octaveShift * 12;
      const lowNote = melodyLow + offset;
      const highNote = melodyHigh + offset;
      const headroom = vocalHigh - highNote;
      const legroom = lowNote - vocalLow;

      const candidate: KeySuggestion = {
        semitones,
        keyName: originalKey ? transposeKeyName(originalKey, semitones) : null,
        fits: headroom >= 0 && legroom >= 0,
        headroom,
        legroom,
        aboveCongregation: highNote > CONGREGATION_CEILING,
        highNote,
        lowNote,
        octaveShift,
      };

      if (bestForKey === null || isBetter(candidate, bestForKey)) {
        bestForKey = candidate;
      }
    }

    if (bestForKey) results.push(bestForKey);
  }

  return results.sort((a, b) => (isBetter(a, b) ? -1 : isBetter(b, a) ? 1 : 0));
}

/** Quanto a melodia estoura a voz, somando os dois extremos. */
function overflow(s: KeySuggestion) {
  return Math.max(0, -s.headroom) + Math.max(0, -s.legroom);
}

/** `a` é uma escolha melhor que `b`? Critério único de ordenação. */
function isBetter(a: KeySuggestion, b: KeySuggestion): boolean {
  // Quem não cabe na voz vai para o fim.
  if (a.fits !== b.fits) return a.fits;

  if (a.fits && b.fits) {
    // Entre os que cabem, evita estourar o teto da congregação.
    if (a.aboveCongregation !== b.aboveCongregation) {
      return !a.aboveCongregation;
    }
    // Depois, o mais equilibrado: sobra parecida em cima e embaixo.
    const balance = (s: KeySuggestion) => Math.abs(s.headroom - s.legroom);
    if (balance(a) !== balance(b)) return balance(a) < balance(b);
  } else if (overflow(a) !== overflow(b)) {
    // Entre os que não cabem, o que estoura menos.
    return overflow(a) < overflow(b);
  }

  // Empate: prefere cantar na oitava escrita e mexer menos no tom.
  if (Math.abs(a.octaveShift) !== Math.abs(b.octaveShift)) {
    return Math.abs(a.octaveShift) < Math.abs(b.octaveShift);
  }
  return Math.abs(a.semitones) < Math.abs(b.semitones);
}

/** Frase pronta explicando a sugestão, sem jargão. */
export function describeSuggestion(suggestion: KeySuggestion): string {
  if (!suggestion.fits) {
    const over = Math.max(0, -suggestion.headroom);
    const under = Math.max(0, -suggestion.legroom);
    if (over > 0 && under > 0) {
      return "A melodia é mais larga que a extensão cadastrada.";
    }
    if (over > 0) {
      return `O agudo passa ${over} semitom${over === 1 ? "" : "s"} do limite.`;
    }
    return `O grave passa ${under} semitom${under === 1 ? "" : "s"} do limite.`;
  }

  const parts: string[] = [];

  if (suggestion.octaveShift !== 0) {
    const count = Math.abs(suggestion.octaveShift);
    const direction = suggestion.octaveShift < 0 ? "abaixo" : "acima";
    parts.push(
      `Cantando ${count === 1 ? "uma oitava" : `${count} oitavas`} ${direction}`
    );
  }

  parts.push(
    `folga de ${suggestion.headroom} semitom${suggestion.headroom === 1 ? "" : "s"} no agudo`
  );
  if (suggestion.aboveCongregation) {
    parts.push("mas alto para a congregação acompanhar");
  }

  const phrase = parts.join(", ");
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}.`;
}
