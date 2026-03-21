import { useState, useEffect, useRef, useCallback } from 'react';
import { detectMultiplePitches, noteToName, noteToOctave } from '../utils/pitchDetection';

export interface DetectedNote {
  note: number;
  name: string;
  octave: number;
  frequency: number;
  cents: number;
  confidence: number;
  timestamp: number;
}

export interface NoteHistoryEntry {
  note: number;
  name: string;
  octave: number;
  timestamp: number;
  age: number;
}

export interface AudioInputDevice {
  deviceId: string;
  label: string;
}

// --- Stabilization parameters ---
const CONFIRM_FRAMES = 4;          // note must appear in N consecutive frames to be confirmed
const HOLD_FRAMES = 4;             // confirmed note stays visible for N frames after disappearing
const HISTORY_MAX_AGE_MS = 2000;   // history notes fade over 2 seconds
const HISTORY_MAX_SIZE = 12;

interface NoteTracker {
  midi: number;
  seenCount: number;       // consecutive frames seen
  missCount: number;        // consecutive frames missed (after confirmed)
  confirmed: boolean;
  lastPitch: { freq: number; cents: number; mag: number };
}

export const useAudioInput = (isActive: boolean, selectedDeviceId?: string, monitorEnabled: boolean = false, monitorVolume: number = 0.8) => {
  const [detectedNotes, setDetectedNotes] = useState<DetectedNote[]>([]);
  const [noteHistory, setNoteHistory] = useState<NoteHistoryEntry[]>([]);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSignalPresent, setIsSignalPresent] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
  const [availableDevices, setAvailableDevices] = useState<AudioInputDevice[]>([]);
  const [activeDeviceLabel, setActiveDeviceLabel] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const monitorGainRef = useRef<GainNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Keep latest monitor values in refs so async startAudio() always reads current values
  const monitorEnabledRef = useRef(monitorEnabled);
  const monitorVolumeRef = useRef(monitorVolume);
  monitorEnabledRef.current = monitorEnabled;
  monitorVolumeRef.current = monitorVolume;

  // Note tracker for stabilization (not in React state — mutated each frame)
  const trackersRef = useRef<Map<number, NoteTracker>>(new Map());
  const historyRef = useRef<NoteHistoryEntry[]>([]);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    if (monitorGainRef.current) {
      monitorGainRef.current.disconnect();
      monitorGainRef.current = null;
    }
    trackersRef.current = new Map();
    historyRef.current = [];
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAvailableDevices(
        devices.filter(d => d.kind === 'audioinput').map(d => ({
          deviceId: d.deviceId,
          label: d.label || `Input ${d.deviceId.slice(0, 8)}...`,
        }))
      );
    } catch { setAvailableDevices([]); }
  }, []);

  useEffect(() => {
    if (isActive) {
      refreshDevices();
      const h = () => refreshDevices();
      navigator.mediaDevices?.addEventListener?.('devicechange', h);
      return () => { navigator.mediaDevices?.removeEventListener?.('devicechange', h); };
    }
  }, [isActive, refreshDevices]);

  useEffect(() => {
    if (!isActive) {
      cleanup();
      setDetectedNotes([]);
      setNoteHistory([]);
      setMicError(null);
      setIsSignalPresent(false);
      setInputLevel(0);
      setActiveDeviceLabel('');
      return;
    }

    let disposed = false;

    const startAudio = async () => {
      try {
        setMicError(null);
        const constraints: MediaTrackConstraints = {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        };
        if (selectedDeviceId && selectedDeviceId !== 'default') {
          constraints.deviceId = { exact: selectedDeviceId };
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
        if (disposed) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          const settings = audioTrack.getSettings();
          const devices = await navigator.mediaDevices.enumerateDevices();
          const matched = devices.find(d => d.kind === 'audioinput' && d.deviceId === settings.deviceId);
          setActiveDeviceLabel(matched?.label || audioTrack.label || '');
          setAvailableDevices(
            devices.filter(d => d.kind === 'audioinput').map(d => ({
              deviceId: d.deviceId,
              label: d.label || `Input ${d.deviceId.slice(0, 8)}...`,
            }))
          );
        }

        const AC = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AC({ sampleRate: 44100 });
        audioContextRef.current = ctx;
        if (ctx.state === 'suspended') await ctx.resume();

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 8192;
        analyser.smoothingTimeConstant = 0.75; // heavy smoothing for stable spectrum
        source.connect(analyser);
        analyserRef.current = analyser;

        // Monitor output — route input to speakers/headphones
        const monitorGain = ctx.createGain();
        monitorGain.gain.value = monitorEnabledRef.current ? monitorVolumeRef.current : 0;
        source.connect(monitorGain);
        monitorGain.connect(ctx.destination);
        monitorGainRef.current = monitorGain;

        const freqBuf = new Float32Array(analyser.frequencyBinCount);
        const timeBuf = new Float32Array(analyser.fftSize);
        const trackers = trackersRef.current;

        let lastTime = 0;
        const INTERVAL = 80; // ~12 fps — slow and stable
        let levelCtr = 0;

        const loop = (ts: number) => {
          if (disposed || !analyserRef.current) return;
          if (ts - lastTime < INTERVAL) {
            animationFrameRef.current = requestAnimationFrame(loop);
            return;
          }
          lastTime = ts;

          analyserRef.current.getFloatFrequencyData(freqBuf);
          analyserRef.current.getFloatTimeDomainData(timeBuf);

          // Level meter
          levelCtr++;
          if (levelCtr % 2 === 0) {
            let r = 0;
            for (let i = 0; i < timeBuf.length; i++) r += timeBuf[i] * timeBuf[i];
            r = Math.sqrt(r / timeBuf.length);
            setInputLevel(Math.min(1, r * 4));
            setIsSignalPresent(r > 0.003);
          }

          const result = detectMultiplePitches(freqBuf, timeBuf, ctx.sampleRate, analyser.fftSize);
          const now = Date.now();

          // Set of MIDI notes detected this frame
          const frameMidis = new Set<number>();
          if (result) {
            for (const n of result.notes) frameMidis.add(n.midiNote);
          }

          // --- Update trackers ---
          // Mark each tracker as seen or missed this frame
          for (const [midi, tr] of trackers) {
            if (frameMidis.has(midi)) {
              tr.seenCount++;
              tr.missCount = 0;
              // Update pitch info
              const pitch = result?.notes.find(n => n.midiNote === midi);
              if (pitch) {
                tr.lastPitch = { freq: pitch.frequency, cents: pitch.cents, mag: pitch.magnitude };
              }
              if (tr.seenCount >= CONFIRM_FRAMES) {
                tr.confirmed = true;
              }
            } else {
              tr.seenCount = 0;
              tr.missCount++;
            }
          }

          // Add new trackers for notes not yet tracked
          for (const midi of frameMidis) {
            if (!trackers.has(midi)) {
              const pitch = result?.notes.find(n => n.midiNote === midi);
              trackers.set(midi, {
                midi,
                seenCount: 1,
                missCount: 0,
                confirmed: false,
                lastPitch: pitch
                  ? { freq: pitch.frequency, cents: pitch.cents, mag: pitch.magnitude }
                  : { freq: 0, cents: 0, mag: -100 },
              });
            }
          }

          // Remove trackers that have been missing too long
          const toRemove: number[] = [];
          for (const [midi, tr] of trackers) {
            if (tr.missCount > HOLD_FRAMES) {
              // Move to history if it was confirmed
              if (tr.confirmed) {
                historyRef.current = [
                  { note: midi, name: noteToName(midi), octave: noteToOctave(midi), timestamp: now, age: 0 },
                  ...historyRef.current,
                ].slice(0, HISTORY_MAX_SIZE);
              }
              toRemove.push(midi);
            }
          }
          for (const midi of toRemove) trackers.delete(midi);

          // Build confirmed notes list
          const confirmed: DetectedNote[] = [];
          for (const [, tr] of trackers) {
            if (tr.confirmed) {
              confirmed.push({
                note: tr.midi,
                name: noteToName(tr.midi),
                octave: noteToOctave(tr.midi),
                frequency: tr.lastPitch.freq,
                cents: tr.lastPitch.cents,
                confidence: Math.min(1, Math.max(0, (tr.lastPitch.mag + 80) / 60)),
                timestamp: now,
              });
            }
          }
          confirmed.sort((a, b) => a.note - b.note);

          setDetectedNotes(confirmed);

          // Update history ages
          const updatedHistory = historyRef.current
            .filter(h => now - h.timestamp < HISTORY_MAX_AGE_MS)
            .map(h => ({ ...h, age: Math.min(1, (now - h.timestamp) / HISTORY_MAX_AGE_MS) }));
          historyRef.current = updatedHistory;
          setNoteHistory([...updatedHistory]);

          animationFrameRef.current = requestAnimationFrame(loop);
        };

        animationFrameRef.current = requestAnimationFrame(loop);
      } catch (err: any) {
        if (disposed) return;
        console.error('Audio input error:', err);
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setMicError('mic_denied');
        } else if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') {
          setMicError('mic_not_found');
        } else {
          setMicError('mic_error');
        }
      }
    };

    startAudio();
    return () => { disposed = true; cleanup(); };
  }, [isActive, selectedDeviceId, cleanup]);

  // Update monitor gain in real-time without restarting audio
  useEffect(() => {
    if (monitorGainRef.current) {
      monitorGainRef.current.gain.setTargetAtTime(
        monitorEnabled ? monitorVolume : 0,
        monitorGainRef.current.context.currentTime,
        0.05 // smooth 50ms ramp to avoid clicks
      );
    }
  }, [monitorEnabled, monitorVolume]);

  const detectedNote = detectedNotes.length > 0
    ? detectedNotes.reduce((best, n) => n.confidence > best.confidence ? n : best, detectedNotes[0])
    : null;

  return {
    detectedNote,
    detectedNotes,
    noteHistory,
    micError,
    isSignalPresent,
    inputLevel,
    availableDevices,
    activeDeviceLabel,
    refreshDevices,
  };
};
