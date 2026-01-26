import { MadeWithDyad } from "@/components/made-with-dyad";
import Fretboard from "@/components/Fretboard";
import Piano from "@/components/Piano";
import { useState, useEffect } from "react";
import * as Tone from 'tone';
import { Button } from "@/components/ui/button";
import { Music, Guitar, Piano as PianoIcon, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_NOTES, SCALES } from "@/lib/fretboardUtils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useSampler } from "@/hooks/useSampler";
import { InstrumentKey, INSTRUMENTS } from "@/lib/audioUtils";

const Index = () => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentKey>('guitar-acoustic');
  const [selectedRoot, setSelectedRoot] = useState<string>("C");
  const [selectedScaleName, setSelectedScaleName] = useState<keyof typeof SCALES>("MAJOR");
  const { theme, setTheme } = useTheme();
  
  const { sampler, isLoaded } = useSampler(selectedInstrument);

  const enableAudio = async () => {
    try {
      await Tone.start();
      if (Tone.context.state === 'running') {
        setTimeout(() => {
          setIsAudioEnabled(true);
        }, 100);
      } else {
        console.error("Audio context failed to start.");
      }
    } catch (e) {
      console.error("Error starting audio context:", e);
    }
  };

  if (!isAudioEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 dark:bg-slate-900 p-4">
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Аудио отключено</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Нажмите кнопку, чтобы включить звук для интерактивного инструмента.
          </p>
          <Button onClick={enableAudio} size="lg">
            <Music className="mr-2 h-5 w-5" />
            Включить звук
          </Button>
        </div>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-stone-100 dark:bg-slate-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Fret & Key Maestro</h1>
        
        <div className="p-4 mb-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="root-select" className="text-gray-700 dark:text-gray-300">Root Note:</Label>
              <Select value={selectedRoot} onValueChange={setSelectedRoot}>
                <SelectTrigger id="root-select" className="w-[120px]">
                  <SelectValue placeholder="Select Root" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_NOTES.map((note) => (
                    <SelectItem key={note} value={note}>{note}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="scale-select" className="text-gray-700 dark:text-gray-300">Scale/Mode:</Label>
              <Select
                value={selectedScaleName}
                onValueChange={(value) => setSelectedScaleName(value as keyof typeof SCALES)}
              >
                <SelectTrigger id="scale-select" className="w-[180px]">
                  <SelectValue placeholder="Select Scale/Mode" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SCALES).map((scale) => (
                    <SelectItem key={scale} value={scale}>{scale}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="instrument-select" className="text-gray-700 dark:text-gray-300">Instrument:</Label>
              <Select
                value={selectedInstrument}
                onValueChange={(value) => setSelectedInstrument(value as InstrumentKey)}
              >
                <SelectTrigger id="instrument-select" className="w-[180px]">
                  <SelectValue placeholder="Select Instrument" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INSTRUMENTS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isLoaded && isAudioEnabled && (
                <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
              <Label htmlFor="dark-mode" className="text-gray-700 dark:text-gray-300">Dark Mode</Label>
            </div>
          </div>
        </div>

        {selectedInstrument !== 'piano' ? (
          <Fretboard 
            selectedRoot={selectedRoot}
            selectedScaleName={selectedScaleName}
            instrument={sampler}
            isLoaded={isLoaded}
            instrumentKey={selectedInstrument}
          />
        ) : (
          <Piano 
            selectedRoot={selectedRoot}
            selectedScaleName={selectedScaleName}
            instrument={sampler}
            isLoaded={isLoaded}
          />
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;