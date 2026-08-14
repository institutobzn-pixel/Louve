/**
 * Detecção de altura (afinador) por autocorrelação normalizada.
 *
 * O sinal do microfone é comparado consigo mesmo deslocado no tempo; o
 * deslocamento que melhor coincide é o período da onda, e daí sai a
 * frequência. A normalização deixa o resultado entre -1 e 1, o que torna
 * a leitura estável mesmo com o volume variando.
 */

/** Lá de referência. */
const A4 = 440;

const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];

/** Nomes em português, como o músico brasileiro fala. */
const NOTE_NAMES_PT = [
  "Dó", "Dó#", "Ré", "Ré#", "Mi", "Fá", "Fá#", "Sol", "Sol#", "Lá", "Lá#", "Si",
];

/** Abaixo disso é silêncio ou ruído de fundo — não vale analisar. */
const RMS_GATE = 0.008;
/** Correlação mínima para aceitar a leitura como nota de verdade. */
const MIN_CORRELATION = 0.5;
/**
 * Um pico dentro dessa margem do melhor conta como o período certo.
 * Sem isso o afinador erra a oitava: o dobro do período também casa bem.
 */
const PEAK_TOLERANCE = 0.9;

/**
 * Devolve a frequência fundamental em Hz, ou null quando não há sinal
 * claro. A faixa cobre do Lá0 (baixo de 5 cordas) ao agudo da voz.
 */
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  minHz = 27.5,
  maxHz = 1600
): number | null {
  const size = buffer.length;

  let rms = 0;
  for (let i = 0; i < size; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / size);
  if (rms < RMS_GATE) return null;

  const minLag = Math.max(2, Math.floor(sampleRate / maxHz));
  const maxLag = Math.min(Math.floor(sampleRate / minHz), Math.floor(size / 2));
  if (maxLag <= minLag) return null;

  const correlations = new Float32Array(maxLag + 2);
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    let energyA = 0;
    let energyB = 0;
    const n = size - lag;
    for (let i = 0; i < n; i++) {
      const a = buffer[i];
      const b = buffer[i + lag];
      sum += a * b;
      energyA += a * a;
      energyB += b * b;
    }
    const denominator = Math.sqrt(energyA * energyB);
    const correlation = denominator > 0 ? sum / denominator : 0;
    correlations[lag] = correlation;
    if (correlation > bestCorrelation) bestCorrelation = correlation;
  }

  if (bestCorrelation < MIN_CORRELATION) return null;

  // Pega o PRIMEIRO pico bom, não o maior: períodos múltiplos também
  // casam quase tão bem, e escolher o maior derrubaria uma oitava.
  const target = bestCorrelation * PEAK_TOLERANCE;
  let bestLag = -1;
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    const value = correlations[lag];
    if (
      value >= target &&
      value >= correlations[lag - 1] &&
      value >= correlations[lag + 1]
    ) {
      bestLag = lag;
      break;
    }
  }
  if (bestLag < 0) return null;

  // Interpolação parabólica: o pico real cai entre duas amostras, e sem
  // isso a leitura fica presa em degraus de vários cents.
  const y1 = correlations[bestLag - 1];
  const y2 = correlations[bestLag];
  const y3 = correlations[bestLag + 1];
  const divisor = 2 * (2 * y2 - y1 - y3);
  const shift = divisor !== 0 ? (y3 - y1) / divisor : 0;
  const period = bestLag + (Math.abs(shift) < 1 ? shift : 0);

  return period > 0 ? sampleRate / period : null;
}

export interface NoteReading {
  /** Nome internacional (C, C#, D…) — o que aparece nos afinadores. */
  name: string;
  /** Nome em português (Dó, Dó#, Ré…). */
  namePt: string;
  /** Oitava científica (Lá4 = 440 Hz). */
  octave: number;
  /** Desvio da nota exata, em cents. Negativo = grave, positivo = agudo. */
  cents: number;
  /** Frequência exata da nota mais próxima. */
  targetHz: number;
  /** Número MIDI da nota. */
  midi: number;
}

/** Converte a frequência lida na nota mais próxima e no desvio em cents. */
export function frequencyToNote(frequency: number): NoteReading | null {
  if (!frequency || frequency <= 0 || !Number.isFinite(frequency)) return null;

  const exact = 12 * Math.log2(frequency / A4) + 69;
  const midi = Math.round(exact);
  if (midi < 0 || midi > 127) return null;

  const cents = Math.round((exact - midi) * 100);
  const index = ((midi % 12) + 12) % 12;

  return {
    name: NOTE_NAMES[index],
    namePt: NOTE_NAMES_PT[index],
    octave: Math.floor(midi / 12) - 1,
    cents,
    targetHz: A4 * Math.pow(2, (midi - 69) / 12),
    midi,
  };
}

/** Dentro dessa margem o afinador acende verde. */
export const IN_TUNE_CENTS = 5;
