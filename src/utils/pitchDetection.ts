// Guitar pitch detection — YIN algorithm (primary) + FFT (supplementary)
// YIN: accurate monophonic fundamental detection via autocorrelation
// FFT: spectral magnitude for confidence/loudness estimation

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
 * YIN pitch detection algorithm.
 * Finds the fundamental frequency from time-domain audio data.
 * Much more accurate than FFT for guitar, especially low strings.
 *
 * Reference: de Cheveigné & Kawahara (2002)
 * "YIN, a fundamental frequency estimator for speech and music"
 */
function yinDetect(
  timeData: Float32Array,
  sampleRate: number,
): { frequency: number; probability: number } | null {
  const bufferSize = timeData.length;
  const halfBuffer = Math.floor(bufferSize / 2);

  // Guitar range: E1 (~41Hz) to E6 (~1319Hz)
  // Period range: sampleRate/maxFreq to sampleRate/minFreq
  const minPeriod = Math.floor(sampleRate / 1200); // ~37 samples at 44100Hz
  const maxPeriod = Math.min(halfBuffer - 1, Math.floor(sampleRate / 60)); // ~735 samples

  if (maxPeriod <= minPeriod) return null;

  // Step 1: Difference function
  // d(τ) = Σ (x[j] - x[j+τ])²
  const diff = new Float32Array(maxPeriod + 1);
  for (let tau = minPeriod; tau <= maxPeriod; tau++) {
    let sum = 0;
    for (let j = 0; j < halfBuffer; j++) {
      const delta = timeData[j] - timeData[j + tau];
      sum += delta * delta;
    }
    diff[tau] = sum;
  }

  // Step 2: Cumulative mean normalized difference function
  // d'(τ) = d(τ) / ((1/τ) * Σ d(j)) for j=1..τ
  // d'(0) = 1 by convention
  const cmndf = new Float32Array(maxPeriod + 1);
  cmndf[0] = 1;
  let runningSum = 0;
  for (let tau = minPeriod; tau <= maxPeriod; tau++) {
    runningSum += diff[tau];
    cmndf[tau] = runningSum > 0 ? (diff[tau] * tau) / runningSum : 1;
  }

  // Step 3: Absolute threshold
  // Find the first tau where cmndf drops below threshold
  const threshold = 0.15; // Strict threshold for guitar (less noise)
  let bestTau = -1;

  for (let tau = minPeriod; tau < maxPeriod; tau++) {
    if (cmndf[tau] < threshold) {
      // Find the local minimum in this dip
      while (tau + 1 < maxPeriod && cmndf[tau + 1] < cmndf[tau]) {
        tau++;
      }
      bestTau = tau;
      break;
    }
  }

  // If no dip found below threshold, find global minimum as fallback
  if (bestTau < 0) {
    let minVal = Infinity;
    for (let tau = minPeriod; tau <= maxPeriod; tau++) {
      if (cmndf[tau] < minVal) {
        minVal = cmndf[tau];
        bestTau = tau;
      }
    }
    // Only accept if minimum is reasonable (< 0.4)
    if (minVal > 0.4) return null;
  }

  if (bestTau < 0) return null;

  // Step 4: Parabolic interpolation for sub-sample accuracy
  let betterTau = bestTau;
  if (bestTau > 0 && bestTau < maxPeriod) {
    const a = cmndf[bestTau - 1];
    const b = cmndf[bestTau];
    const c = cmndf[bestTau + 1];
    const denom = 2 * (a - 2 * b + c);
    if (denom !== 0) {
      betterTau = bestTau + (a - c) / denom;
    }
  }

  const frequency = sampleRate / betterTau;
  const probability = 1 - (cmndf[bestTau] || 0);

  // Sanity check: frequency must be in guitar range
  if (frequency < 60 || frequency > 1200) return null;

  return { frequency, probability };
}

/**
 * Get the magnitude (loudness) of a specific frequency from FFT data.
 * Used to estimate confidence/volume for the YIN-detected pitch.
 */
function getMagnitudeAtFreq(
  freqData: Float32Array,
  targetFreq: number,
  sampleRate: number,
  fftSize: number,
): number {
  const binSize = sampleRate / fftSize;
  const bin = Math.round(targetFreq / binSize);
  if (bin < 0 || bin >= freqData.length) return -100;

  // Check a few bins around the target for the strongest signal
  let maxMag = -Infinity;
  for (let i = Math.max(0, bin - 2); i <= Math.min(freqData.length - 1, bin + 2); i++) {
    if (freqData[i] > maxMag) maxMag = freqData[i];
  }
  return maxMag;
}

/**
 * Detect pitch using YIN algorithm with FFT magnitude estimation.
 * Primary detection method — accurate fundamental frequency detection
 * that doesn't confuse harmonics with fundamentals.
 */
export function detectMultiplePitches(
  freqData: Float32Array,
  timeData: Float32Array,
  sampleRate: number,
  fftSize: number,
): MultiPitchResult | null {
  // RMS check — is there any signal?
  let rms = 0;
  for (let i = 0; i < timeData.length; i++) {
    rms += timeData[i] * timeData[i];
  }
  rms = Math.sqrt(rms / timeData.length);
  if (rms < 0.005) return null;

  // Use YIN for accurate fundamental detection
  const yinResult = yinDetect(timeData, sampleRate);
  if (!yinResult) return null;

  const freq = yinResult.frequency;
  const midiFloat = frequencyToNote(freq);
  const midi = Math.round(midiFloat);

  // Get magnitude from FFT for confidence estimation
  const mag = getMagnitudeAtFreq(freqData, freq, sampleRate, fftSize);

  // Check if magnitude is reasonable (not just noise)
  // Use a noise floor estimate from FFT
  const freqPerBin = sampleRate / fftSize;
  const minBin = Math.max(2, Math.floor(75 / freqPerBin));
  const maxBin = Math.min(freqData.length - 2, Math.ceil(1000 / freqPerBin));
  const vals: number[] = [];
  for (let i = minBin; i <= maxBin; i++) vals.push(freqData[i]);
  vals.sort((a, b) => a - b);
  const noiseFloor = vals[Math.floor(vals.length * 0.2)];

  // Require signal to be at least 15 dB above noise
  if (mag < noiseFloor + 15) return null;

  const notes: DetectedPitch[] = [{
    frequency: Math.round(freq * 10) / 10,
    midiNote: midi,
    name: noteToName(midi),
    octave: noteToOctave(midi),
    cents: Math.round((midiFloat - midi) * 100),
    magnitude: Math.round(mag * 10) / 10,
  }];

  return { notes, rms };
}
