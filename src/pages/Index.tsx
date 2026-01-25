import { MadeWithDyad } from "@/components/made-with-dyad";
import Fretboard from "@/components/Fretboard";
import Piano from "@/components/Piano";
import { useState, useRef, useEffect } from "react";
import * as Tone from 'tone';
import { Button } from "@/components/ui/button";
import { Music, Guitar, Piano as PianoIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_NOTES, SCALES } from "@/lib/fretboardUtils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

const Index = () => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isSamplesLoading, setIsSamplesLoading] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<'guitar' | 'piano'>('guitar');
  const [selectedRoot, setSelectedRoot] = useState<string>("C");
  const [selectedScaleName, setSelectedScaleName] = useState<keyof typeof SCALES>("MAJOR");
  const { theme, setTheme } = useTheme();
  
  const guitarSampler = useRef<Tone.Sampler | null>(null);
  const pianoSampler = useRef<Tone.Sampler | null>(null);

  const pianoUrls = {
    "A0": "A0.mp3", "C1": "C1.mp3", "Eb1": "Eb1.mp3", "Gb1": "Gb1.mp3",
    "A1": "A1.mp3", "C2": "C2.mp3", "Eb2": "Eb2.mp3", "Gb2": "Gb2.mp3",
    "A2": "A2.mp3", "C3": "C3.mp3", "Eb3": "Eb3.mp3", "Gb3": "Gb3.mp3",
    "A3": "A3.mp3", "C4": "C4.mp3", "Eb4": "Eb4.mp3", "Gb4": "Gb4.mp3",
    "A4": "A4.mp3", "C5": "C5.mp3", "Eb5": "Eb5.mp3", "Gb5": "Gb5.mp3",
    "A5": "A5.mp3", "C6": "C6.mp3", "Eb6": "Eb6.mp3", "Gb6": "Gb6.mp3",
    "A6": "A6.mp3", "C7": "C7.mp3", "Eb7": "Eb7.mp3", "Gb7": "Gb7.mp3",
    "A7": "A7.mp3", "C8": "C8.mp3"
  };

  const guitarUrls = {
    "A2": "A2.mp3", "C3": "C3.mp3", "Eb3": "Eb3.mp3", "Gb3": "Gb3.mp3",
    "A3": "A3.mp3", "C4": "C4.mp3", "Eb4": "Eb4.mp3", "Gb4": "Gb4.mp3",
    "A4": "A4.mp3", "C5": "C5.mp3", "Eb5": "Eb5.mp3", "Gb5": "Gb5.mp3",
    "A5": "A5.mp3", "C6": "C6.mp3"
  };

  useEffect(() => {
    return () => {
      guitarSampler.current?.dispose();
      pianoSampler.current?.dispose();
    };
  }, []);

  const enableAudio = async () => {
    try {
      setIsSamplesLoading(true);
      await Tone.start();

      const pianoLoaded = new Promise<void>((resolve) => {
        pianoSampler.current = new Tone.Sampler({
          urls: pianoUrls,
          baseUrl: "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/",
          onload: () => resolve(),
        }).toDestination();
      });

      const guitarLoaded = new Promise<void>((resolve) => {
        guitarSampler.current = new Tone.Sampler({
          urls: guitarUrls,
          baseUrl: "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_guitar_nylon-mp3/",
          onload: () => resolve(),
        }).toDestination();
      });

      await Promise.all([pianoLoaded, guitarLoaded]);

      if (Tone.context.state === 'running') {
        setIsAudioEnabled(true);
      } else {
        console.error("Audio context failed to start.");
      }
    } catch (e) {
      console.error("Error starting audio context:", e);
    } finally {
      setIsSamplesLoading(false);
    }
  };

  if (!isAudioEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 dark:bg-slate-900 p-4">
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            {isSamplesLoading ? "Loading High-Quality Sounds..." : "Audio Disabled"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            {isSamplesLoading
              ? "Please wait while we load realistic instrument samples. This may take a few seconds."
              : "Click the button to enable high-quality realistic audio for the interactive tools."}
          </p>
          <Button onClick={enableAudio} size="lg" disabled={isSamplesLoading}>
            <Music className="mr-2 h-5 w-5" />
            {isSamplesLoading ? "Loading..." : "Enable Realistic Audio"}
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

            <ToggleGroup 
              type="single" 
              value={selectedInstrument} 
              onValueChange={(value) => { if (value) setSelectedInstrument(value) }}
              className="border border-gray-200 dark:border-gray-700 rounded-md"
            >
              <ToggleGroupItem value="guitar" aria-label="Select guitar">
                <Guitar className="h-5 w-5 mr-2" /> Guitar
              </ToggleGroupItem>
              <ToggleGroupItem value="piano" aria-label="Select piano">
                <PianoIcon className="h-5 w-5 mr-2" /> Piano
              </ToggleGroupItem>
            </ToggleGroup>
            
            <div className="flex items-center space-x-2">
              <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
              <Label htmlFor="dark-mode" className="text-gray-700 dark:text-gray-300">Dark Mode</Label>
            </div>
          </div>
        </div>

        {selectedInstrument === 'guitar' ? (
          <Fretboard 
            selectedRoot={selectedRoot}
            selectedScaleName={selectedScaleName}
            sampler={guitarSampler}
          />
        ) : (
          <Piano 
            selectedRoot={selectedRoot}
            selectedScaleName={selectedScaleName}
            sampler={pianoSampler}
          />
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;