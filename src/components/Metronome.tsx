import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Button } from '@/components/ui/button';
import { Play, Square, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const Metronome: React.FC = () => {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [isMuted, setIsMuted] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);

  const clickRef = useRef<Tone.Synth | null>(null);
  const loopRef = useRef<number | null>(null);

  useEffect(() => {
    clickRef.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();

    return () => {
      clickRef.current?.dispose();
      if (loopRef.current !== null) {
        Tone.Transport.clear(loopRef.current);
      }
    };
  }, []);

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  const toggleMetronome = async () => {
    if (isPlaying) {
      Tone.Transport.stop();
      if (loopRef.current !== null) {
        Tone.Transport.clear(loopRef.current);
        loopRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      await Tone.start();

      loopRef.current = Tone.Transport.scheduleRepeat((time) => {
        const beat = (Tone.Transport.getTicksAtTime(time) / Tone.Transport.PPQ) % 4;
        const beatIndex = Math.floor(beat);

        Tone.Draw.schedule(() => {
          setCurrentBeat(beatIndex + 1);
        }, time);

        if (!isMuted) {
          const freq = beatIndex === 0 ? "A5" : "E5";
          clickRef.current?.triggerAttackRelease(freq, "32n", time, beatIndex === 0 ? 1 : 0.5);
        }
      }, "4n");

      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-xl backdrop-blur-sm w-full flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold dark:text-gray-100">{t('metronome')}</h3>

      <div className="flex gap-2">
        {[1, 2, 3, 4].map((beat) => (
          <div
            key={beat}
            className={cn(
              "w-8 h-2 rounded-full transition-all duration-100",
              currentBeat === beat
                ? (beat === 1 ? "bg-red-500 scale-y-150" : "bg-sky-500 scale-y-125")
                : "bg-slate-200 dark:bg-slate-700"
            )}
          />
        ))}
      </div>

      <div className="flex items-center gap-6 w-full">
        <Button
          variant={isPlaying ? "destructive" : "default"}
          size="icon"
          onClick={toggleMetronome}
          className="shrink-0"
        >
          {isPlaying ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">{bpm} {t('bpm')}</Label>
          </div>
          <Slider
            value={[bpm]}
            min={40}
            max={240}
            step={1}
            onValueChange={(v) => setBpm(v[0])}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className="shrink-0"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default Metronome;
