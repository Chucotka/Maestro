const SAMPLES_BASE_URL = "https://nbrosowsky.github.io/tonejs-instruments/samples/";

export type InstrumentKey = "piano" | "guitar-acoustic" | "guitar-electric" | "bass-electric" | "violin" | "cello";

export interface InstrumentConfig {
  name: string;
  baseUrl: string;
  notes: string[];
}

export const INSTRUMENTS: Record<InstrumentKey, InstrumentConfig> = {
  piano: {
    name: "Grand Piano",
    baseUrl: `${SAMPLES_BASE_URL}piano/`,
    notes: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "As1", "As2", "As3", "As4", "As5", "As6", "As7", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "Cs1", "Cs2", "Cs3", "Cs4", "Cs5", "Cs6", "Cs7", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "Ds1", "Ds2", "Ds3", "Ds4", "Ds5", "Ds6", "Ds7", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "Fs1", "Fs2", "Fs3", "Fs4", "Fs5", "Fs6", "Fs7", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "Gs1", "Gs2", "Gs3", "Gs4", "Gs5", "Gs6", "Gs7"],
  },
  "guitar-acoustic": {
    name: "Acoustic Guitar",
    baseUrl: `${SAMPLES_BASE_URL}guitar-acoustic/`,
    notes: ["Fs2", "Fs3", "Fs4", "A2", "A3", "A4", "C3", "C4", "C5", "Ds2", "Ds3", "Ds4"],
  },
  "guitar-electric": {
    name: "Electric Guitar",
    baseUrl: `${SAMPLES_BASE_URL}guitar-electric/`,
    notes: ["Ds3", "Ds4", "Ds5", "E2", "Fs2", "Fs3", "Fs4", "Fs5", "A2", "A3", "A4", "A5", "C3", "C4", "C5", "C6", "Cs2"],
  },
  "bass-electric": {
    name: "Electric Bass",
    baseUrl: `${SAMPLES_BASE_URL}bass-electric/`,
    notes: ["As1", "As2", "As3", "As4", "Cs1", "Cs2", "Cs3", "Cs4", "Cs5", "E1", "E2", "E3", "E4", "G1", "G2", "G3", "G4"],
  },
  violin: {
    name: "Violin",
    baseUrl: `${SAMPLES_BASE_URL}violin/`,
    notes: ["A3", "A4", "A5", "A6", "C4", "C5", "C6", "C7", "E4", "E5", "E6", "G4", "G5", "G6"],
  },
  cello: {
    name: "Cello",
    baseUrl: `${SAMPLES_BASE_URL}cello/`,
    notes: ["A2", "A3", "A4", "As2", "As3", "As4", "B2", "B3", "B4", "C2", "C3", "C4", "C5", "Cs3", "Cs4", "Cs5", "D2", "D3", "D4", "D5", "Ds2", "Ds3", "Ds4", "E2", "E3", "E4", "F2", "F3", "F4", "Fs2", "Fs3", "Fs4", "G2", "G3", "G4", "Gs2", "Gs3", "Gs4"],
  }
};

export const getInstrumentSamples = (key: InstrumentKey): Record<string, string> => {
  const config = INSTRUMENTS[key];
  const samples: Record<string, string> = {};
  config.notes.forEach(note => {
    samples[note.replace("s", "#")] = `${note}.mp3`;
  });
  return samples;
};
