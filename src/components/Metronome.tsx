import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Button } from '@/components/ui/button';
import { Play, Square, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';
type SoundType = 'click' | 'woodblock' | 'cowbell';

const Metronome: React.FC = () => {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [isMuted, setIsMuted] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [soundType, setSoundType] = useState<SoundType>('click');

  const synthRef = useRef<Tone.Synth | Tone.MembraneSynth | Tone.MetalSynth | null>(null);
  const loopRef = useRef<number | null>(null);

  useEffect(() => {
    // Basic click synth
    updateSynth('click');

    return () => {
      synthRef.current?.dispose();
      if (loopRef.current !== null) {
        Tone.Transport.clear(loopRef.current);
      }
    };
  }, []);

  const updateSynth = (type: SoundType) => {
    synthRef.current?.dispose();

    if (type === 'click') {
      synthRef.current = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
      }).toDestination();
    } else if (type === 'woodblock') {
      synthRef.current = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: {
          attack: 0.0006,
          decay: 0.5,
          sustain: 0
        }
      }).toDestination();
    } else if (type === 'cowbell') {
      synthRef.current = new Tone.MetalSynth({
        harmonicity: 12,
        resonance: 800,
        modulationIndex: 20,
        envelope: { attack: 0.001, decay: 0.1, release: 0.1 }
      }).toDestination();
    }
  };

  useEffect(() => {
    updateSynth(soundType);
  }, [soundType]);

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  const getBeatsPerMeasure = () => {
    switch(timeSignature) {
      case '2/4': return 2;
      case '3/4': return 3;
      case '4/4': return 4;
      case '6/8': return 6;
      default: return 4;
    }
  };

  const getBeatInterval = () => {
    return timeSignature === '6/8' ? '8n' : '4n';
  };

  const toggleMetronome = async () => {
    if (isPlaying) {
      if (loopRef.current !== null) {
        Tone.Transport.clear(loopRef.current);
        loopRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      await Tone.start();

      const beatsPerMeasure = getBeatsPerMeasure();
      const interval = getBeatInterval();

      loopRef.current = Tone.Transport.scheduleRepeat((time) => {
        const secondsPerBeat = Tone.Ticks(interval).toSeconds();
        const totalBeats = Math.round(Tone.Transport.seconds / secondsPerBeat);
        const beatIndex = totalBeats % beatsPerMeasure;

        Tone.Draw.schedule(() => {
          setCurrentBeat(beatIndex + 1);
        }, time);

        if (!isMuted && synthRef.current) {
          const isFirstBeat = beatIndex === 0;

          if (soundType === 'cowbell') {
            (synthRef.current as Tone.MetalSynth).triggerAttackRelease("32n", time, isFirstBeat ? 1 : 0.4);
          } else if (soundType === 'woodblock') {
            const freq = isFirstBeat ? "A4" : "E4";
            (synthRef.current as Tone.MembraneSynth).triggerAttackRelease(freq, "32n", time, isFirstBeat ? 1 : 0.5);
          } else {
            const freq = isFirstBeat ? "A5" : "E5";
            (synthRef.current as Tone.Synth).triggerAttackRelease(freq, "32n", time, isFirstBeat ? 1 : 0.5);
          }
        }
      }, interval);

      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const beats = Array.from({ length: getBeatsPerMeasure() }, (_, i) => i + 1);

  return (
    <div className="p-4 bg-[#1a1a1a] border border-stone-800 rounded-lg shadow-xl w-full flex flex-col items-center gap-4">
      <div className="flex justify-between w-full items-center">
        <h3 className="text-lg font-bold text-[#b06a3b]">{t('metronome')}</h3>
        <div className="flex gap-2">
          <select
            value={timeSignature}
            onChange={(e) => setTimeSignature(e.target.value as TimeSignature)}
            className="bg-[#2a2a2a] border-stone-700 text-xs text-gray-300 rounded px-2 py-1"
          >
            <option value="2/4">2/4</option>
            <option value="3/4">3/4</option>
            <option value="4/4">4/4</option>
            <option value="6/8">6/8</option>
          </select>
          <select
            value={soundType}
            onChange={(e) => setSoundType(e.target.value as SoundType)}
            className="bg-[#2a2a2a] border-stone-700 text-xs text-gray-300 rounded px-2 py-1"
          >
            <option value="click">Click</option>
            <option value="woodblock">Woodblock</option>
            <option value="cowbell">Cowbell</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        {beats.map((beat) => (
          <div
            key={beat}
            className={cn(
              "w-8 h-2 rounded-full transition-all duration-100",
              currentBeat === beat
                ? (beat === 1 ? "bg-orange-500 scale-y-150" : "bg-stone-300 scale-y-125")
                : "bg-stone-800"
            )}
          />
        ))}
      </div>

      <div className="flex items-center gap-6 w-full">
        <Button
          variant={isPlaying ? "destructive" : "default"}
          size="icon"
          onClick={toggleMetronome}
          className={cn("shrink-0", !isPlaying && "bg-[#b06a3b] hover:bg-[#8e5630]")}
        >
          {isPlaying ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-gray-300">{bpm} {t('bpm')}</Label>
          </div>
          <Slider
            value={[bpm]}
            min={40}
            max={240}
            step={1}
            onValueChange={(v) => setBpm(v[0])}
            className="[&_[role=slider]]:bg-[#b06a3b]"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className="shrink-0 text-gray-400 hover:text-white"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default Metronome;
