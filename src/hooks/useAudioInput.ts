import { useState, useEffect, useRef } from 'react';
import { autoCorrelate, frequencyToNote, noteToName, noteToOctave } from '../utils/pitchDetection';

export interface DetectedNote {
  note: number;
  name: string;
  octave: number;
  frequency: number;
}

export const useAudioInput = (isActive: boolean) => {
  const [detectedNote, setDetectedNote] = useState<DetectedNote | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      return;
    }

    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.fftSize;
        const dataArray = new Float32Array(bufferLength);

        const updatePitch = () => {
          analyser.getFloatTimeDomainData(dataArray);
          const freq = autoCorrelate(dataArray, audioContext.sampleRate);

          if (freq !== -1) {
            const note = frequencyToNote(freq);
            setDetectedNote({
              note,
              name: noteToName(note),
              octave: noteToOctave(note),
              frequency: freq
            });
          } else {
            // Optionally keep the last note or clear it
            // setDetectedNote(null);
          }

          animationFrameRef.current = requestAnimationFrame(updatePitch);
        };

        updatePitch();
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };

    startAudio();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isActive]);

  return detectedNote;
};
