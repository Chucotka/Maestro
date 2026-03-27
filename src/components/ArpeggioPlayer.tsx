import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Tone from 'tone';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useI18n } from '@/lib/i18n';
import { ALL_NOTES } from '@/lib/fretboardUtils';
import { cn } from '@/lib/utils';

interface ArpeggioNote {
  noteName: string;
  string?: number;
  fret?: number;
  noteWithOctave?: string;
}

interface ArpeggioPosition {
  label: string;
  fret: number;
  index: number;
}

interface ArpeggioPlayerProps {
  notes: string[] | ArpeggioNote[];
  sampler: Tone.Sampler | null;
  instrumentType?: string;
  onNotePlay?: (note: ArpeggioNote | null) => void;
  positions?: ArpeggioPosition[];
  currentPositionIndex?: number;
  onPositionChange?: (index: number) => void;
}

type ArpeggioPattern =
  | 'up' | 'down' | 'updown'
  | 'broken' | 'skip' | 'outsideIn' | 'insideOut'
  | 'random' | 'pairs' | 'tremolo' | 'sweep';

type NoteLength = '4n' | '8n' | '8t' | '16n';

function applyPattern(notes: ArpeggioNote[], pattern: ArpeggioPattern): ArpeggioNote[] {
  const src = [...notes];
  if (src.length === 0) return [];

  switch (pattern) {
    case 'up':
      return src;

    case 'down':
      return [...src].reverse();

    case 'updown': {
      if (src.length <= 1) return src;
      const down = [...src].reverse().slice(1, -1);
      return [...src, ...down];
    }

    case 'broken': {
      // Zigzag: 0,2,1,3,2,4,3,5...
      const result: ArpeggioNote[] = [];
      for (let i = 0; i < src.length; i++) {
        result.push(src[i]);
        if (i + 2 < src.length) {
          result.push(src[i + 2]);
        }
      }
      // Deduplicate consecutive
      return result.filter((n, i) => i === 0 || n !== result[i - 1]);
    }

    case 'skip': {
      // Play odd indices then even: 0,2,4,1,3,5
      const evens = src.filter((_, i) => i % 2 === 0);
      const odds = src.filter((_, i) => i % 2 !== 0);
      return [...evens, ...odds];
    }

    case 'outsideIn': {
      // Low-High-Low+1-High-1...
      const result: ArpeggioNote[] = [];
      let lo = 0, hi = src.length - 1;
      while (lo <= hi) {
        result.push(src[lo]);
        if (lo !== hi) result.push(src[hi]);
        lo++;
        hi--;
      }
      return result;
    }

    case 'insideOut': {
      // Start from middle, expand outward
      const result: ArpeggioNote[] = [];
      const mid = Math.floor(src.length / 2);
      let lo = mid, hi = mid;
      if (src.length % 2 === 0) {
        lo = mid - 1;
        hi = mid;
      }
      result.push(src[lo]);
      if (lo !== hi) result.push(src[hi]);
      while (lo > 0 || hi < src.length - 1) {
        if (lo > 0) { lo--; result.push(src[lo]); }
        if (hi < src.length - 1) { hi++; result.push(src[hi]); }
      }
      return result;
    }

    case 'random': {
      const shuffled = [...src];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    case 'pairs': {
      // Ascending pairs: (0,1), (1,2), (2,3)...
      const result: ArpeggioNote[] = [];
      for (let i = 0; i < src.length - 1; i++) {
        result.push(src[i]);
        result.push(src[i + 1]);
      }
      return result.length > 0 ? result : src;
    }

    case 'tremolo': {
      // Each note repeated twice
      const result: ArpeggioNote[] = [];
      for (const n of src) {
        result.push(n);
        result.push(n);
      }
      return result;
    }

    case 'sweep': {
      // Up then down full, including endpoints repeated for sweep feel
      if (src.length <= 2) return [...src, ...[...src].reverse()];
      return [...src, ...[...src].reverse()];
    }

    default:
      return src;
  }
}

const PATTERN_OPTIONS: { value: ArpeggioPattern; labelKey: string; icon: string }[] = [
  { value: 'up', labelKey: 'up', icon: '↑' },
  { value: 'down', labelKey: 'down', icon: '↓' },
  { value: 'updown', labelKey: 'updown', icon: '↕' },
  { value: 'broken', labelKey: 'broken', icon: '⚡' },
  { value: 'skip', labelKey: 'skip', icon: '⏭' },
  { value: 'pairs', labelKey: 'pairs', icon: '⏩' },
  { value: 'outsideIn', labelKey: 'outsideIn', icon: '⟩⟨' },
  { value: 'insideOut', labelKey: 'insideOut', icon: '⟨⟩' },
  { value: 'tremolo', labelKey: 'tremolo', icon: '〰' },
  { value: 'sweep', labelKey: 'sweep', icon: '↻' },
  { value: 'random', labelKey: 'random', icon: '🎲' },
];

const NOTE_LENGTH_OPTIONS: { value: NoteLength; label: string }[] = [
  { value: '4n', label: '1/4' },
  { value: '8n', label: '1/8' },
  { value: '8t', label: '1/8T' },
  { value: '16n', label: '1/16' },
];

const ArpeggioPlayer: React.FC<ArpeggioPlayerProps> = ({ notes, sampler, instrumentType, onNotePlay, positions, currentPositionIndex = 0, onPositionChange }) => {
  const { t } = useI18n();
  const t_safe = (key: string) => (t as (k: string) => string)(key);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [pattern, setPattern] = useState<ArpeggioPattern>('up');
  const [noteLength, setNoteLength] = useState<NoteLength>('8n');
  const [octaves, setOctaves] = useState(1);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const sequenceRef = useRef<Tone.Sequence | null>(null);

  // Compute pattern notes for visual display (independent of sampler)
  const patternNotes = useMemo(() => {
    if (notes.length === 0) return [];

    const noteObjects: ArpeggioNote[] = notes.map(n => typeof n === 'string' ? { noteName: n } : n);

    let currentOctave = instrumentType === 'bass' ? 1 : instrumentType === 'ukulele' ? 4 : 3;
    let lastNoteIndex = -1;

    const baseSequenceData = noteObjects.map((obj) => {
      const n = obj.noteName;
      const nIdx = ALL_NOTES.indexOf(n);

      let noteWithOctave = obj.noteWithOctave;
      if (!noteWithOctave) {
        if (nIdx !== -1 && nIdx < lastNoteIndex) {
          currentOctave++;
        }
        lastNoteIndex = nIdx;
        noteWithOctave = `${n}${currentOctave}`;
      }

      return { ...obj, noteWithOctave };
    });

    let extendedData: ArpeggioNote[] = [...baseSequenceData];
    if (octaves > 1) {
      for (let oct = 1; oct < octaves; oct++) {
        const octaveNotes = baseSequenceData.map(note => {
          const match = note.noteWithOctave!.match(/([A-G]#?)(\d+)/);
          if (match) {
            const origOctave = parseInt(match[2], 10);
            return {
              noteName: note.noteName,
              noteWithOctave: `${match[1]}${origOctave + oct}`,
            };
          }
          return { noteName: note.noteName, noteWithOctave: note.noteWithOctave };
        });
        extendedData = [...extendedData, ...octaveNotes];
      }
    }

    return applyPattern(extendedData, pattern);
  }, [notes, pattern, instrumentType, octaves]);

  const stopArpeggio = useCallback(() => {
    if (onNotePlay) onNotePlay(null);
    setIsPlaying(false);
    setCurrentNoteIndex(-1);
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
      sequenceRef.current = null;
    }
  }, [onNotePlay]);

  const createSequence = useCallback(() => {
    if (!sampler || patternNotes.length === 0) return null;
    if (!sampler.loaded) return null;

    let noteIdx = 0;
    return new Tone.Sequence((time, obj) => {
      sampler.triggerAttackRelease(obj.noteWithOctave!, noteLength, time);
      const capturedIdx = noteIdx % patternNotes.length;
      noteIdx++;
      if (onNotePlay) {
        Tone.Draw.schedule(() => {
          onNotePlay(obj);
          setCurrentNoteIndex(capturedIdx);
        }, time);
      }
    }, patternNotes, noteLength);
  }, [sampler, patternNotes, onNotePlay, noteLength]);

  const startArpeggio = useCallback(async () => {
    if (!sampler) return;

    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }

    // Stop and reset Transport to ensure clean state
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = 0;

    if (sequenceRef.current) {
      sequenceRef.current.dispose();
    }

    const seq = createSequence();
    if (seq) {
      sequenceRef.current = seq;
      sequenceRef.current.start(0);

      Tone.Transport.bpm.value = tempo;
      Tone.Transport.start();
      setIsPlaying(true);
    } else {
      toast.error("Could not start arpeggio. Check if audio is loaded.");
    }
  }, [sampler, tempo, createSequence]);

  // Handle prop/setting changes while playing — recreate sequence with new notes/pattern
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    if (isPlayingRef.current && sequenceRef.current) {
      const wasStarted = sequenceRef.current.state === 'started';
      sequenceRef.current.stop();
      sequenceRef.current.dispose();

      const seq = createSequence();
      if (seq) {
        sequenceRef.current = seq;
        if (wasStarted) sequenceRef.current.start(0);
      }
    }
    // Only react to patternNotes/sampler changes, not isPlaying
  }, [patternNotes, sampler, createSequence]);

  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  useEffect(() => {
    return () => {
      stopArpeggio();
    };
  }, [stopArpeggio]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#1a1a1a] border border-stone-800 rounded-lg shadow-xl w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#b06a3b]">{t_safe('arpeggio')}</h3>
        {!sampler && <span className="text-[10px] text-stone-500 animate-pulse">{t_safe('loading')}</span>}
      </div>

      {/* Position / Start fret selector */}
      {positions && positions.length > 0 && (
        <div>
          <div className="text-[10px] text-gray-500 uppercase font-bold mb-1.5 tracking-wider">{t_safe('startFret')}</div>
          <div className="flex flex-wrap gap-1">
            {positions.map((pos) => (
              <Button
                key={pos.index}
                variant={currentPositionIndex === pos.index ? "default" : "outline"}
                size="sm"
                onClick={() => onPositionChange?.(pos.index)}
                className={cn(
                  "text-[10px] h-7 px-2 gap-1 transition-all",
                  currentPositionIndex === pos.index
                    ? "bg-[#b06a3b] text-white hover:bg-[#8e5630] shadow-md shadow-[#b06a3b]/30"
                    : "text-gray-400 border-stone-700 hover:border-stone-500 hover:text-gray-200"
                )}
              >
                <span className="text-[9px] text-gray-500">{pos.fret > 0 ? `${pos.fret}л` : '0'}</span>
                {pos.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Pattern selector grid */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase font-bold mb-1.5 tracking-wider">{t_safe('pattern')}</div>
        <div className="flex flex-wrap gap-1">
          {PATTERN_OPTIONS.map(opt => (
            <Button
              key={opt.value}
              variant={pattern === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPattern(opt.value)}
              className={cn(
                "text-[10px] h-7 px-2 gap-1 transition-all",
                pattern === opt.value
                  ? "bg-[#b06a3b] text-white hover:bg-[#8e5630] shadow-md shadow-[#b06a3b]/30"
                  : "text-gray-400 border-stone-700 hover:border-stone-500 hover:text-gray-200"
              )}
            >
              <span className="text-xs">{opt.icon}</span>
              {t_safe(opt.labelKey)}
            </Button>
          ))}
        </div>
      </div>

      {/* Transport + Tempo + Note length */}
      <div className="flex items-center gap-3 w-full">
        <Button
          variant={isPlaying ? "destructive" : "default"}
          size="icon"
          onClick={isPlaying ? stopArpeggio : startArpeggio}
          disabled={!sampler}
          className={cn("shrink-0 h-10 w-10", !isPlaying && "bg-[#b06a3b] hover:bg-[#8e5630]")}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        {pattern === 'random' && isPlaying && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              // Re-shuffle by restarting
              if (isPlaying) {
                stopArpeggio();
                setTimeout(() => startArpeggio(), 50);
              }
            }}
            className="shrink-0 h-10 w-10 text-gray-400 border-stone-700"
            title="Re-shuffle"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}

        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
            <span>{t_safe('tempo')}</span>
            <span className="text-[#b06a3b]">{tempo} {t_safe('bpm')}</span>
          </div>
          <Slider
            value={[tempo]}
            min={40}
            max={300}
            step={5}
            onValueChange={v => setTempo(v[0])}
            className="[&_[role=slider]]:bg-[#b06a3b]"
          />
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <div className="text-[10px] text-gray-500 font-bold uppercase">{t_safe('noteLength')}</div>
          <Select value={noteLength} onValueChange={(v) => setNoteLength(v as NoteLength)}>
            <SelectTrigger className="h-8 w-[70px] bg-[#2a2a2a] border-stone-700 text-xs text-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] border-stone-800 text-gray-300">
              {NOTE_LENGTH_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <div className="text-[10px] text-gray-500 font-bold uppercase">{t_safe('octaves')}</div>
          <Select value={String(octaves)} onValueChange={(v) => setOctaves(Number(v))}>
            <SelectTrigger className="h-8 w-[55px] bg-[#2a2a2a] border-stone-700 text-xs text-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] border-stone-800 text-gray-300">
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Visual note sequence indicator */}
      {patternNotes.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2 bg-black/30 rounded-md max-h-16 overflow-y-auto">
          {patternNotes.map((note, i) => (
            <span
              key={`${i}-${note.noteName}`}
              className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 rounded transition-all duration-100",
                i === currentNoteIndex
                  ? "bg-[#b06a3b] text-white scale-110 shadow-lg shadow-[#b06a3b]/50"
                  : "bg-stone-800 text-gray-500"
              )}
            >
              {note.noteName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArpeggioPlayer;
