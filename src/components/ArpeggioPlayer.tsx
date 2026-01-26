import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Button } from '@/components/ui/button';
import { Play, Square, FastForward, Rewind } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useI18n } from '@/lib/i18n';
import { ALL_NOTES } from '@/lib/fretboardUtils';

interface ArpeggioPlayerProps {
  notes: string[]; // Note names like ["C", "E", "G"]
  sampler: Tone.Sampler | null;
}

const ArpeggioPlayer: React.FC<ArpeggioPlayerProps> = ({ notes, sampler }) => {
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
    let currentOctave = 4;
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

    const events = sequence.map((note, i) => ({
      time: i * (60 / tempo) * 0.5, // 8th notes
      note
    }));

    partRef.current = new Tone.Part((time, value) => {
      sampler.triggerAttackRelease(value.note, "8n", time);
    }, events);

    partRef.current.loop = true;
    partRef.current.loopEnd = events.length * (60 / tempo) * 0.5;

    Tone.Transport.start();
    partRef.current.start(0);
  };

  useEffect(() => {
    return () => {
      stopArpeggio();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <div className="flex items-center gap-4">
        <Button
          variant={isPlaying ? "destructive" : "default"}
          size="icon"
          onClick={isPlaying ? stopArpeggio : startArpeggio}
        >
          {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <div className="flex flex-col gap-1 w-32">
          <div className="flex justify-between text-xs dark:text-gray-400">
            <span>{t('tempo')}</span>
            <span>{tempo} {t('bpm')}</span>
          </div>
          <Slider
            value={[tempo]}
            min={40}
            max={240}
            onValueChange={v => setTempo(v[0])}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={direction === 'up' ? "default" : "outline"}
            size="sm"
            onClick={() => setDirection('up')}
          >
            {t('up')}
          </Button>
          <Button
            variant={direction === 'down' ? "default" : "outline"}
            size="sm"
            onClick={() => setDirection('down')}
          >
            {t('down')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArpeggioPlayer;
