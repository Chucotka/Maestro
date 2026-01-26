import { MadeWithDyad } from "@/components/made-with-dyad";
import Fretboard from "@/components/Fretboard";
import Piano from "@/components/Piano";
import CircleOfFifths from "@/components/CircleOfFifths";
import ProgressionGenerator from "@/components/ProgressionGenerator";
import ArpeggioPlayer from "@/components/ArpeggioPlayer";
import Metronome from "@/components/Metronome";
import { useState, useRef, useEffect, useCallback } from "react";
import * as Tone from 'tone';
import { Button } from "@/components/ui/button";
import { Music, Guitar, Piano as PianoIcon, Zap, Volume2, Volume1, VolumeX, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_NOTES, SCALES, CHORDS, EMOTIONS, CAGED_SHAPES, romanToChord, getScaleNotes, getChordNotes } from "@/lib/fretboardUtils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

type InstrumentType = 'guitar' | 'piano' | 'clean' | 'distortion' | 'bass';

const Index = () => {
  const { t, language, setLanguage } = useI18n();
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [loadingInstruments, setLoadingInstruments] = useState<Set<InstrumentType>>(new Set());
  const [loadedInstruments, setLoadedInstruments] = useState<Set<InstrumentType>>(new Set());
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('guitar');
  const [selectedRoot, setSelectedRoot] = useState<string>("C");
  const [selectedScaleName, setSelectedScaleName] = useState<keyof typeof SCALES>("MAJOR");
  const [selectedChordName, setSelectedChordName] = useState<keyof typeof CHORDS>("Major");
  const [selectedCagedShape, setSelectedCagedShape] = useState<keyof typeof CAGED_SHAPES>("E");
  const [viewMode, setViewMode] = useState<'scale' | 'chord' | 'caged'>('scale');
  const [volume, setVolume] = useState(0.8);
  const { theme, setTheme } = useTheme();
  
  const samplers = useRef<Partial<Record<InstrumentType, Tone.Sampler>>>({});

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

  const bassUrls = {
    "E1": "E1.mp3", "G1": "G1.mp3", "Bb1": "Bb1.mp3", "Db2": "Db2.mp3",
    "E2": "E2.mp3", "G2": "G2.mp3", "Bb2": "Bb2.mp3", "Db3": "Db3.mp3",
    "E3": "E3.mp3", "G3": "G3.mp3"
  };

  useEffect(() => {
    const currentSamplers = samplers.current;
    return () => {
      Object.values(currentSamplers).forEach(s => s?.dispose());
    };
  }, []);

  useEffect(() => {
    Tone.Destination.volume.value = Tone.gainToDb(volume);
  }, [volume]);

  const loadInstrument = useCallback(async (inst: InstrumentType) => {
    if (loadedInstruments.has(inst) || loadingInstruments.has(inst)) return;

    setLoadingInstruments(prev => new Set(prev).add(inst));

    try {
      const urls = inst === 'piano' ? pianoUrls : inst === 'bass' ? bassUrls : guitarUrls;
      let baseUrl = "";

      switch(inst) {
        case 'piano': baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/"; break;
        case 'guitar': baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_guitar_nylon-mp3/"; break;
        case 'clean': baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/electric_guitar_clean-mp3/"; break;
        case 'distortion': baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/distortion_guitar-mp3/"; break;
        case 'bass': baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/electric_bass_finger-mp3/"; break;
      }

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timeout loading samples")), 30000);
        samplers.current[inst] = new Tone.Sampler({
          urls,
          baseUrl,
          onload: () => {
            clearTimeout(timeout);
            resolve();
          },
          onerror: (err) => {
            clearTimeout(timeout);
            reject(err);
          }
        }).toDestination();
      });

      setLoadedInstruments(prev => new Set(prev).add(inst));
    } catch (e) {
      console.error(`Error loading instrument ${inst}:`, e);
      toast.error(`Failed to load ${inst} samples. Please check your connection.`);
    } finally {
      setLoadingInstruments(prev => {
        const next = new Set(prev);
        next.delete(inst);
        return next;
      });
    }
  }, [loadedInstruments, loadingInstruments]);

  const enableAudio = async () => {
    try {
      await Tone.start();
      await loadInstrument(selectedInstrument);
      setIsAudioEnabled(true);
    } catch (e) {
      console.error("Error starting audio context:", e);
      toast.error("Could not start audio. Please try again.");
    }
  };

  useEffect(() => {
    if (isAudioEnabled) {
      loadInstrument(selectedInstrument);
    }
  }, [selectedInstrument, isAudioEnabled]);

  const isSelectedLoading = loadingInstruments.has(selectedInstrument);

  const activeNotesForArpeggio = viewMode === 'scale'
    ? getScaleNotes(selectedRoot, SCALES[selectedScaleName])
    : viewMode === 'chord'
    ? getChordNotes(selectedRoot, CHORDS[selectedChordName])
    : getChordNotes(selectedRoot, CHORDS['Major']);

  if (!isAudioEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 dark:bg-slate-900 p-4">
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            {loadingInstruments.size > 0 ? t('loadingInstruments') : t('audioDisabled')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            {loadingInstruments.size > 0
              ? t('loadingMessage')
              : t('enableAudio')}
          </p>
          <Button onClick={enableAudio} size="lg" disabled={loadingInstruments.size > 0}>
            {loadingInstruments.size > 0 ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Music className="mr-2 h-5 w-5" />}
            {loadingInstruments.size > 0 ? t('loading') : t('enableAudio')}
          </Button>
        </div>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-stone-100 dark:bg-slate-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="w-24"></div> {/* Spacer */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">{t('title')}</h1>
          <div className="flex gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <Button
              variant={language === 'en' ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setLanguage('en')}
            >EN</Button>
            <Button
              variant={language === 'ru' ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setLanguage('ru')}
            >RU</Button>
          </div>
        </div>
        
        <div className="p-4 mb-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="root-select" className="text-gray-700 dark:text-gray-300">{t('rootNote')}:</Label>
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

            {viewMode === 'scale' && (
              <div className="flex items-center gap-2">
                <Label htmlFor="scale-select" className="text-gray-700 dark:text-gray-300">{t('scaleMode')}:</Label>
                <Select
                  value={selectedScaleName}
                  onValueChange={(value) => setSelectedScaleName(value as keyof typeof SCALES)}
                >
                  <SelectTrigger id="scale-select" className="w-[180px]">
                    <SelectValue placeholder="Select Scale/Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SCALES).map((scale) => (
                      <SelectItem key={scale} value={scale}>{t(scale as any)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {viewMode === 'chord' && (
              <div className="flex items-center gap-2">
                <Label htmlFor="chord-select" className="text-gray-700 dark:text-gray-300">{t('chordType')}:</Label>
                <Select
                  value={selectedChordName}
                  onValueChange={(value) => setSelectedChordName(value as keyof typeof CHORDS)}
                >
                  <SelectTrigger id="chord-select" className="w-[180px]">
                    <SelectValue placeholder="Select Chord Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CHORDS).map((chord) => (
                      <SelectItem key={chord} value={chord}>{t(chord as any)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {viewMode === 'caged' && (
              <div className="flex items-center gap-2">
                <Label htmlFor="caged-select" className="text-gray-700 dark:text-gray-300">{t('cagedShape')}:</Label>
                <Select
                  value={selectedCagedShape}
                  onValueChange={(value) => setSelectedCagedShape(value as keyof typeof CAGED_SHAPES)}
                >
                  <SelectTrigger id="caged-select" className="w-[120px]">
                    <SelectValue placeholder="Select Shape" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CAGED_SHAPES).map((shape) => (
                      <SelectItem key={shape} value={shape}>{shape} Shape</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <ToggleGroup 
              type="single" 
              value={selectedInstrument} 
              onValueChange={(value) => { if (value) setSelectedInstrument(value as InstrumentType) }}
              className="border border-gray-200 dark:border-gray-700 rounded-md flex-wrap"
            >
              <ToggleGroupItem value="guitar" aria-label="Select acoustic guitar">
                <Guitar className="h-4 w-4 mr-2" /> {t('acoustic')}
              </ToggleGroupItem>
              <ToggleGroupItem value="clean" aria-label="Select clean guitar">
                <Volume2 className="h-4 w-4 mr-2" /> {t('clean')}
              </ToggleGroupItem>
              <ToggleGroupItem value="distortion" aria-label="Select distortion guitar">
                <Zap className="h-4 w-4 mr-2" /> {t('distortion')}
              </ToggleGroupItem>
              <ToggleGroupItem value="bass" aria-label="Select bass">
                <Music className="h-4 w-4 mr-2" /> {t('bass')}
              </ToggleGroupItem>
              <ToggleGroupItem value="piano" aria-label="Select piano">
                <PianoIcon className="h-4 w-4 mr-2" /> {t('piano')}
              </ToggleGroupItem>
            </ToggleGroup>
            
            <div className="flex items-center space-x-2">
              {volume === 0 ? <VolumeX className="h-5 w-5 text-gray-500" /> : volume < 0.5 ? <Volume1 className="h-5 w-5 text-gray-500" /> : <Volume2 className="h-5 w-5 text-gray-500" />}
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                className="w-24 md:w-32"
                onValueChange={(vals) => setVolume(vals[0] / 100)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
              <Label htmlFor="dark-mode" className="text-gray-700 dark:text-gray-300">{t('dark')}</Label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="relative w-full">
            {isSelectedLoading && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] rounded-lg">
                <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-2" />
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('loading')}</p>
              </div>
            )}

            {selectedInstrument === 'piano' ? (
              <Piano
                selectedRoot={selectedRoot}
                selectedScaleName={selectedScaleName}
                selectedChordName={selectedChordName}
                mode={viewMode === 'caged' ? 'chord' : viewMode}
                onModeChange={(mode) => setViewMode(mode as any)}
                sampler={samplers.current.piano || null}
              />
            ) : (
              <Fretboard
                selectedRoot={selectedRoot}
                selectedScaleName={selectedScaleName}
                selectedChordName={selectedChordName}
                selectedCagedShape={selectedCagedShape}
                mode={viewMode}
                onModeChange={setViewMode}
                instrumentType={selectedInstrument}
                sampler={samplers.current[selectedInstrument] || null}
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-6">
              <CircleOfFifths
                selectedRoot={selectedRoot}
                onNoteSelect={setSelectedRoot}
              />
              <Metronome />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <ArpeggioPlayer
                notes={activeNotesForArpeggio}
                sampler={samplers.current[selectedInstrument] || samplers.current.piano || null}
              />

              <ProgressionGenerator
                selectedRoot={selectedRoot}
                onChordSelect={(root, type) => {
                  setSelectedRoot(root);
                  setSelectedChordName(type);
                  setViewMode('chord');
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 pb-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;