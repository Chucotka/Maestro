// Polyphonic pitch detection for guitar — FFT spectral analysis
// with aggressive harmonic rejection and strict thresholds

export interface DetectedPitch {
  frequency: number;
  midiNote: number;
  name: string;
  octave: number;
  cents: number;
  magnitude: number;
}

export interface MultiPitchResult {
  notes: DetectedPitch[];
  rms: number;
}

const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const frequencyToNote = (frequency: number): number =>
  12 * (Math.log(frequency / 440) / Math.log(2)) + 69;

export const noteToName = (note: number): string =>
  NOTE_STRINGS[((note % 12) + 12) % 12];

export const noteToOctave = (note: number): number =>
  Math.floor(note / 12) - 1;

export const noteToFrequency = (note: number): number =>
  440 * Math.pow(2, (note - 69) / 12);

/**
 * Detect multiple simultaneous pitches from FFT data.
 * Designed specifically for guitar — aggressive harmonic filtering,
 * high threshold to avoid false positives.
 */
export function detectMultiplePitches(
  freqData: Float32Array,
  timeData: Float32Array,
  sampleRate: number,
  fftSize: number,
): MultiPitchResult | null {
  // RMS check
  let rms = 0;
  for (let i = 0; i < timeData.length; i++) {
    rms += timeData[i] * timeData[i];
  }
  rms = Math.sqrt(rms / timeData.length);
  if (rms < 0.005) return null;

  const freqPerBin = sampleRate / fftSize;

  // Guitar fundamental range: E2 (82Hz) to B5 (~988Hz)
  // Keep narrow to avoid picking up upper harmonics as fundamentals
  const minFreq = 75;
  const maxFreq = 1000;
  const minBin = Math.max(2, Math.floor(minFreq / freqPerBin));
  const maxBin = Math.min(freqData.length - 2, Math.ceil(maxFreq / freqPerBin));

  // Compute noise floor from the quieter quarter of the spectrum
  const vals: number[] = [];
  for (let i = minBin; i <= maxBin; i++) vals.push(freqData[i]);
  vals.sort((a, b) => a - b);
  const noiseFloor = vals[Math.floor(vals.length * 0.2)];

  // HIGH threshold: 30 dB above noise — only prominent peaks
  const peakThreshold = noiseFloor + 30;

  // Find spectral peaks (strict: must dominate 3 neighbors each side)
  interface Peak {
    bin: number;
    freq: number;
    mag: number;
    midi: number;
    midiFloat: number;
  }

  const peaks: Peak[] = [];
  for (let i = minBin + 3; i < maxBin - 3; i++) {
    const v = freqData[i];
    if (
      v > peakThreshold &&
      v >= freqData[i - 1] && v >= freqData[i + 1] &&
      v > freqData[i - 2] && v > freqData[i + 2] &&
      v > freqData[i - 3] && v > freqData[i + 3]
    ) {
      // Parabolic interpolation for sub-bin accuracy
      const a = freqData[i - 1], b = freqData[i], g = freqData[i + 1];
      const d = a - 2 * b + g;
      const p = d !== 0 ? 0.5 * (a - g) / d : 0;
      const freq = (i + p) * freqPerBin;
      if (freq < minFreq || freq > maxFreq) continue;
      const mf = frequencyToNote(freq);
      const midi = Math.round(mf);
      peaks.push({ bin: i, freq, mag: v, midi, midiFloat: mf });
    }
  }

  if (peaks.length === 0) return null;

  // Sort by magnitude (strongest first)
  peaks.sort((a, b) => b.mag - a.mag);

  // Merge peaks within ±1 semitone (keep strongest)
  const merged: Peak[] = [];
  for (const p of peaks) {
    const dup = merged.find(m => Math.abs(m.midi - p.midi) <= 1);
    if (!dup) merged.push(p);
  }

  // Aggressive harmonic rejection:
  // Process strongest first; mark weaker peaks that are harmonics of stronger ones
  const fundamentals: Peak[] = [];
  for (const peak of merged) {
    let isHarmonic = false;

    for (const fund of fundamentals) {
      // Check if peak is the Nth harmonic of fund (N = 2..12)
      for (let h = 2; h <= 12; h++) {
        const expected = fund.freq * h;
        const tol = h <= 4 ? 0.015 : 0.025; // tighter for lower harmonics
        if (Math.abs(peak.freq - expected) / expected < tol) {
          isHarmonic = true;
          break;
        }
      }
      if (isHarmonic) break;
    }

    // Also check: is peak a subharmonic ghost? (F/2 or F/3 of a much stronger peak)
    if (!isHarmonic) {
      for (const fund of fundamentals) {
        for (const div of [2, 3]) {
          if (Math.abs(fund.freq / peak.freq - div) < 0.03 && fund.mag > peak.mag + 6) {
            isHarmonic = true;
            break;
          }
        }
        if (isHarmonic) break;
      }
    }

    if (!isHarmonic) {
      fundamentals.push(peak);
    }
  }

  if (fundamentals.length === 0) return null;

  // Keep at most 6 (guitar has 6 strings)
  const top6 = fundamentals.slice(0, 6);
  const maxMag = top6[0].mag;

  // Only keep notes within 15 dB of the strongest (strict relative threshold)
  const strong = top6.filter(p => p.mag >= maxMag - 15);

  if (strong.length === 0) return null;

  const notes: DetectedPitch[] = strong.map(p => ({
    frequency: Math.round(p.freq * 10) / 10,
    midiNote: p.midi,
    name: noteToName(p.midi),
    octave: noteToOctave(p.midi),
    cents: Math.round((p.midiFloat - p.midi) * 100),
    magnitude: Math.round(p.mag * 10) / 10,
  }));

  notes.sort((a, b) => a.midiNote - b.midiNote);
  return { notes, rms };
}
