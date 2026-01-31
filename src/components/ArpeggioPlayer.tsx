import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Button } from '@/components/ui/button';
import { Play, Square, FastForward, Rewind } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useI18n } from '@/lib/i18n';
import { ALL_NOTES } from '@/lib/fretboardUtils';
import { cn } from '@/lib/utils';

interface ArpeggioPlayerProps {
  notes: string[]; // Note names like ["C", "E", "G"]
  sampler: Tone.Sampler | null;
  instrumentType?: string;
}

const ArpeggioPlayer: React.FC<ArpeggioPlayerProps> = ({ notes, sampler, instrumentType }) => {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [direction, setDirection] = useState<'up' | 'down' | 'updown'>('up');
  const sequenceRef = useRef<Tone.Sequence | null>(null);

  const stopArpeggio = useCallback(() => {
    setIsPlaying(false);
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
      sequenceRef.current = null;
    }
    // We don't stop the whole Transport here to avoid killing the metronome
  }, []);

  const startArpeggio = useCallback(async () => {
    if (!sampler) {
      console.warn("Sampler not ready for arpeggiator");
      return;
    }
    if (notes.length === 0) return;

    await Tone.start();

    // Create actual notes with octaves for playback, ensuring they go up
    let currentOctave = instrumentType === 'bass' ? 1 : 3;
    let lastNoteIndex = -1;

    const playNotes = notes.map((n) => {
      const noteIndex = ALL_NOTES.indexOf(n);
      if (noteIndex !== -1 && noteIndex < lastNoteIndex) {
        currentOctave++;
      }
      lastNoteIndex = noteIndex;
      return `${n}${currentOctave}`;
    });

    let notesToPlay = [...playNotes];
    if (direction === 'down') notesToPlay.reverse();
    if (direction === 'updown') notesToPlay = [...playNotes, ...[...playNotes].reverse().slice(1, -1)];

    Tone.Transport.bpm.value = tempo;

    sequenceRef.current = new Tone.Sequence((time, note) => {
      sampler.triggerAttackRelease(note, "8n", time);
    }, notesToPlay, "8n");

    sequenceRef.current.start(0);

    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }
    setIsPlaying(true);
  }, [sampler, notes, direction, tempo, instrumentType]);

  // Handle prop changes while playing
  useEffect(() => {
    if (isPlaying) {
      stopArpeggio();
      startArpeggio();
    }
  }, [notes, direction, tempo, sampler, instrumentType, isPlaying, stopArpeggio, startArpeggio]);

  useEffect(() => {
    return () => {
      stopArpeggio();
    };
  }, [stopArpeggio]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-[#1a1a1a] border border-stone-800 rounded-lg shadow-xl w-full">
      <h3 className="text-lg font-bold text-[#b06a3b] self-start">{t('arpeggio')}</h3>
      <div className="flex items-center gap-6 w-full">
        <Button
          variant={isPlaying ? "destructive" : "default"}
          size="icon"
          onClick={isPlaying ? stopArpeggio : startArpeggio}
          className={cn("shrink-0", !isPlaying && "bg-[#b06a3b] hover:bg-[#8e5630]")}
        >
          {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>{t('tempo')}</span>
            <span>{tempo} {t('bpm')}</span>
          </div>
          <Slider
            value={[tempo]}
            min={40}
            max={240}
            onValueChange={v => setTempo(v[0])}
            className="[&_[role=slider]]:bg-[#b06a3b]"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={direction === 'up' ? "default" : "outline"}
            size="sm"
            onClick={() => setDirection('up')}
            className={cn(direction === 'up' ? "bg-stone-700 text-white" : "text-gray-400 border-stone-800")}
          >
            {t('up')}
          </Button>
          <Button
            variant={direction === 'down' ? "default" : "outline"}
            size="sm"
            onClick={() => setDirection('down')}
            className={cn(direction === 'down' ? "bg-stone-700 text-white" : "text-gray-400 border-stone-800")}
          >
            {t('down')}
          </Button>
          <Button
            variant={direction === 'updown' ? "default" : "outline"}
            size="sm"
            onClick={() => setDirection('updown')}
            className={cn(direction === 'updown' ? "bg-stone-700 text-white" : "text-gray-400 border-stone-800")}
          >
            ↕
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArpeggioPlayer;
