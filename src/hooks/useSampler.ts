import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { InstrumentKey, getInstrumentSamples, INSTRUMENTS } from '@/lib/audioUtils';

export const useSampler = (instrumentKey: InstrumentKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const samplerRef = useRef<Tone.Sampler | null>(null);

  useEffect(() => {
    setIsLoaded(false);

    const samples = getInstrumentSamples(instrumentKey);
    const baseUrl = INSTRUMENTS[instrumentKey].baseUrl;

    const sampler = new Tone.Sampler({
      urls: samples,
      baseUrl: baseUrl,
      onload: () => {
        console.log(`${INSTRUMENTS[instrumentKey].name} loaded`);
        setIsLoaded(true);
      },
      onerror: (error) => {
        console.error(`Error loading sampler for ${instrumentKey}:`, error);
      }
    }).toDestination();

    samplerRef.current = sampler;

    return () => {
      sampler.dispose();
    };
  }, [instrumentKey]);

  return { sampler: samplerRef, isLoaded };
};
