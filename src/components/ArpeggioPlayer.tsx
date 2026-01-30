import React, { useState, useEffect, useRef } from 'react';
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
  const partRef = useRef<Tone.Part | null>(null);

  const stopArpeggio = () => {
    setIsPlaying(false);
    if (partRef.current) {
      partRef.current.stop();
      partRef.current.dispose();
      partRef.current = null;
    }
    Tone.Transport.stop();
  };

  const startArpeggio = async () => {
    if (!sampler || notes.length === 0) return;

    await Tone.start();
    setIsPlaying(true);

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

    let sequence = [...playNotes];
    if (direction === 'down') sequence.reverse();
    if (direction === 'updown') sequence = [...playNotes, ...[...playNotes].reverse().slice(1, -1)];

    Tone.Transport.bpm.value = tempo;

    // Use "8n" as a base for timing
    partRef.current = new Tone.Part((time, note) => {
      sampler.triggerAttackRelease(note, "8n", time);
    }, sequence.map((note, i) => [Tone.Time("8n").toSeconds() * i, note]));

    partRef.current.loop = true;
    partRef.current.loopEnd = Tone.Time("8n").toSeconds() * sequence.length;

    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }
    partRef.current.start(0);
  };

  useEffect(() => {
    return () => {
      stopArpeggio();
    };
  }, []);

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
