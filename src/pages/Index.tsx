import Fretboard from "@/components/Fretboard";
import Piano from "@/components/Piano";
import CircleOfFifths from "@/components/CircleOfFifths";
import ProgressionGenerator from "@/components/ProgressionGenerator";
import ArpeggioPlayer from "@/components/ArpeggioPlayer";
import Metronome from "@/components/Metronome";
import { useState, useRef, useEffect, useCallback } from "react";
import * as Tone from 'tone';
import { Button } from "@/components/ui/button";
import { Music, Guitar, Piano as PianoIcon, Zap, Volume2, Volume1, VolumeX, Square, Pause, Loader2, ChevronLeft, ChevronRight, Settings, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ALL_NOTES, SCALES, CHORDS, GENRES, CAGED_SHAPES, CHORD_VOICINGS, GUITAR_TUNINGS, romanToChord, getScaleNotes, getChordNotes, findScalesByNotes, getScaleFormula } from "@/lib/fretboardUtils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAudioInput } from "@/hooks/useAudioInput";

type InstrumentType = 'guitar' | 'piano' | 'clean' | 'distortion' | 'bass' | 'ukulele';

const PIANO_URLS = {
  "A0": "A0.mp3", "C1": "C1.mp3", "Eb1": "Eb1.mp3", "Gb1": "Gb1.mp3",
  "A1": "A1.mp3", "C2": "C2.mp3", "Eb2": "Eb2.mp3", "Gb2": "Gb2.mp3",
  "A2": "A2.mp3", "C3": "C3.mp3", "Eb3": "Eb3.mp3", "Gb3": "Gb3.mp3",
  "A3": "A3.mp3", "C4": "C4.mp3", "Eb4": "Eb4.mp3", "Gb4": "Gb4.mp3",
  "A4": "A4.mp3", "C5": "C5.mp3", "Eb5": "Eb5.mp3", "Gb5": "Gb5.mp3",
  "A5": "A5.mp3", "C6": "C6.mp3", "Eb6": "Eb6.mp3", "Gb6": "Gb6.mp3",
  "A6": "A6.mp3", "C7": "C7.mp3", "Eb7": "Eb7.mp3", "Gb7": "Gb7.mp3",
  "A7": "A7.mp3", "C8": "C8.mp3"
};

const GUITAR_URLS = {
  "A2": "A2.mp3", "C3": "C3.mp3", "Eb3": "Eb3.mp3", "Gb3": "Gb3.mp3",
  "A3": "A3.mp3", "C4": "C4.mp3", "Eb4": "Eb4.mp3", "Gb4": "Gb4.mp3",
  "A4": "A4.mp3", "C5": "C5.mp3", "Eb5": "Eb5.mp3", "Gb5": "Gb5.mp3",
  "A5": "A5.mp3", "C6": "C6.mp3"
};

const UKULELE_URLS = {
  "A3": "A3.mp3", "C4": "C4.mp3", "Eb4": "Eb4.mp3", "Gb4": "Gb4.mp3",
  "A4": "A4.mp3", "C5": "C5.mp3", "Eb5": "Eb5.mp3", "Gb5": "Gb5.mp3",
  "A5": "A5.mp3", "C6": "C6.mp3"
};

const BASS_URLS = {
  "E1": "E1.mp3", "G1": "G1.mp3", "Bb1": "Bb1.mp3", "Db2": "Db2.mp3",
  "E2": "E2.mp3", "G2": "G2.mp3", "Bb2": "Bb2.mp3", "Db3": "Db3.mp3",
  "E3": "E3.mp3", "G3": "G3.mp3"
};

const Index = () => {
  const { t, language, setLanguage } = useI18n();
  const t_safe = (key: string) => t(key as never);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [loadingInstruments, setLoadingInstruments] = useState<Set<InstrumentType>>(new Set());
  const [loadedInstruments, setLoadedInstruments] = useState<Set<InstrumentType>>(new Set());
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('guitar');
  const [selectedRoot, setSelectedRoot] = useState<string>("C");
  const [selectedScaleName, setSelectedScaleName] = useState<keyof typeof SCALES>("MAJOR");
  const [selectedChordName, setSelectedChordName] = useState<keyof typeof CHORDS>("Major");
  const [currentVoicingIndex, setCurrentVoicingIndex] = useState(0);
  const [selectedCagedShape, setSelectedCagedShape] = useState<keyof typeof CAGED_SHAPES>("Shape E");
  const [selectedTuningName, setSelectedTuningName] = useState<string>("Standard");
  const [viewMode, setViewMode] = useState<'scale' | 'chord' | 'caged' | 'quiz' | 'finder' | 'notes' | 'triads' | 'arpeggios' | 'virtual'>('scale');
  const [volume, setVolume] = useState(0.8);
  const [searchQuery, setSearchQuery] = useState('');
  const [quizTarget, setQuizTarget] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const detectedNote = useAudioInput(isListening);
  const { theme, setTheme } = useTheme();
  
  const samplers = useRef<Partial<Record<InstrumentType, Tone.Sampler>>>({});
  const arpeggioRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const playbackPartRef = useRef<Tone.Part | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const stopCurrent = useCallback(() => {
    if (playbackPartRef.current) {
      playbackPartRef.current.stop();
      playbackPartRef.current.dispose();
      playbackPartRef.current = null;
    }
    if (stopTimeoutRef.current !== null) {
      Tone.Transport.clear(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playCurrent = useCallback((forceStart: boolean | number | React.MouseEvent = false) => {
    const isForced = forceStart === true || typeof forceStart === 'number';
    if (!isForced && isPlayingRef.current) {
      stopCurrent();
      return;
    }

    const inst = selectedInstrument;
    const sampler = samplers.current[inst];
    if (!sampler || Tone.context.state !== 'running') {
      toast.error("Audio not ready");
      return;
    }

    // Determine what notes to play based on viewMode
    let notes: string[] = [];
    let isChord = false;

    if (viewMode === 'chord') {
      const chordMap = CHORD_VOICINGS[selectedChordName] || CHORD_VOICINGS["Major"];
      const voicingNames = Object.keys(chordMap);
      const vIdx = typeof forceStart === 'number' ? forceStart : currentVoicingIndex;
      const voicingName = voicingNames[vIdx % voicingNames.length];
      const vNotes = getVoicingNotes(selectedRoot, selectedChordName, voicingName, GUITAR_TUNINGS[selectedTuningName as keyof typeof GUITAR_TUNINGS]);

      const sampler = samplers.current[selectedInstrument];
      if (sampler) {
        sampler.triggerAttackRelease(vNotes.map(vn => vn.noteWithOctave), "2n");
        setIsPlaying(true);
        setTimeout(() => setIsPlaying(false), 2000);
      }
      return;
    } else if (viewMode === 'scale') {
      notes = getScaleNotes(selectedRoot, SCALES[selectedScaleName]);
    } else if (viewMode === 'caged' && selectedCagedShape) {
      // For CAGED, we can play the chord notes
      notes = getChordNotes(selectedRoot, CHORDS['Major']);
      isChord = true;
    } else {
      // Default to scale notes for other modes
      notes = getScaleNotes(selectedRoot, SCALES[selectedScaleName]);
    }

    if (notes.length === 0) return;

    let currentOctave = inst === 'bass' ? 1 : inst === 'ukulele' ? 4 : 3;
    let lastIdx = -1;
    const playNotes = notes.map(n => {
      const idx = ALL_NOTES.indexOf(n);
      if (idx < lastIdx) currentOctave++;
      lastIdx = idx;
      return `${n}${currentOctave}`;
    });

    if (playbackPartRef.current) {
      playbackPartRef.current.dispose();
    }

    if (isChord) {
      sampler.triggerAttackRelease(playNotes, "2n");
      // For chords, it's short, but we can still set isPlaying for a moment
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    } else {
      const partEvents = playNotes.map((note, i) => ({ time: i * 0.25, note }));

      // Add the root note an octave higher at the end for completion
      const rootIdx = ALL_NOTES.indexOf(notes[0]);
      let finalOctave = currentOctave;
      if (rootIdx < lastIdx) finalOctave++;
      partEvents.push({ time: notes.length * 0.25, note: `${notes[0]}${finalOctave}` });

      playbackPartRef.current = new Tone.Part((time, event) => {
        sampler.triggerAttackRelease(event.note, "8n", time);
      }, partEvents).start(0);

      playbackPartRef.current.onstep = (time, event) => {
        // Optional: track progress
      };

      const duration = (partEvents.length) * 0.25;

      setIsPlaying(true);

      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
      }

      // Automatically stop after duration
      stopTimeoutRef.current = Tone.Transport.scheduleOnce(() => {
        setIsPlaying(false);
        stopTimeoutRef.current = null;
      }, `+${duration + 0.5}`);
    }
  }, [selectedInstrument, selectedRoot, selectedChordName, currentVoicingIndex, selectedScaleName, viewMode, selectedCagedShape, stopCurrent]);

  // Auto-play when root or type changed
  useEffect(() => {
    if ((viewMode === 'chord' || viewMode === 'scale') && isAudioEnabled) {
      playCurrent(true); // forceStart to avoid toggle during auto-play
    }
    // Reset voicing when chord changes
    setCurrentVoicingIndex(0);
  }, [selectedRoot, selectedChordName, selectedScaleName, viewMode, isAudioEnabled, playCurrent]);

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
      const urls = inst === 'piano' ? PIANO_URLS : inst === 'bass' ? BASS_URLS : inst === 'ukulele' ? UKULELE_URLS : GUITAR_URLS;
      let baseUrl = "";

      switch(inst) {
        case 'piano': baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/"; break;
        case 'guitar': baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_guitar_nylon-mp3/"; break;
        case 'clean': baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/electric_guitar_clean-mp3/"; break;
        case 'distortion': baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/distortion_guitar-mp3/"; break;
        case 'bass': baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/electric_bass_finger-mp3/"; break;
        case 'ukulele': baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_guitar_nylon-mp3/"; break;
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

    // Auto-switch away from CAGED if ukulele is selected
    if (selectedInstrument === 'ukulele' && viewMode === 'caged') {
      setViewMode('scale');
      toast.info("CAGED mode is for guitar. Switched to Scale mode.");
    }
  }, [selectedInstrument, isAudioEnabled, loadInstrument, viewMode]);

  const isSelectedLoading = loadingInstruments.has(selectedInstrument);

  const activeNotesForArpeggio = viewMode === 'scale'
    ? getScaleNotes(selectedRoot, SCALES[selectedScaleName])
    : viewMode === 'chord'
    ? getChordNotes(selectedRoot, CHORDS[selectedChordName])
    : viewMode === 'caged'
    ? getChordNotes(selectedRoot, CHORDS['Major'])
    : getScaleNotes(selectedRoot, SCALES[selectedScaleName]);

  if (!isAudioEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] p-4">
        <div className="flex flex-col items-center justify-center p-8 bg-[#1a1a1a] border border-stone-800 rounded-lg shadow-2xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-[#b06a3b]">
            {loadingInstruments.size > 0 ? t('loadingInstruments') : t('audioDisabled')}
          </h2>
          <p className="text-gray-400 mb-6 text-center">
            {loadingInstruments.size > 0
              ? t('loadingMessage')
              : t('enableAudio')}
          </p>
          <Button onClick={enableAudio} size="lg" disabled={loadingInstruments.size > 0} className="bg-[#b06a3b] hover:bg-[#8e5630] text-white font-bold">
            {loadingInstruments.size > 0 ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Music className="mr-2 h-5 w-5" />}
            {loadingInstruments.size > 0 ? t('loading') : t('enableAudio')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#121212] transition-colors duration-300">
      {/* Top Navigation Bar from Reference Image */}
      <div className="w-full bg-[#1e1e1e] border-b border-stone-800 px-4 py-2 mb-4 overflow-x-auto landscape:mb-1 landscape:py-1">
        <div className="flex items-center justify-center gap-1 md:gap-4 min-w-max landscape:gap-2">
          {[
            { id: 'chords', label: t('chords'), action: () => setViewMode('chord') },
            { id: 'triads', label: t('triads'), action: () => { setViewMode('chord'); setSelectedChordName('Major'); toast.info("Triad mode active"); } },
            { id: 'quiz', label: t('quiz'), action: () => setViewMode('quiz') },
            { id: 'finder', label: t('finder'), action: () => setViewMode('finder') },
            { id: 'scales', label: t('scales'), action: () => setViewMode('scale') },
            { id: 'caged', label: t('caged'), action: () => setViewMode('caged'), hidden: selectedInstrument === 'ukulele' },
            { id: 'arpeggios', label: t('arpeggios'), action: () => { arpeggioRef.current?.scrollIntoView({ behavior: 'smooth' }); toast.info("Arpeggiator"); } },
            { id: 'notes', label: t('notes'), action: () => setViewMode('notes') },
            {
              id: 'tunings',
              label: t('tunings'),
              dropdown: GUITAR_TUNINGS,
              onSelect: (val: string) => setSelectedTuningName(val)
            },
            { id: 'virtual', label: t('virtual'), action: () => { setViewMode('virtual'); toast.info(t('virtual_desc')); } }
          ].map((item) => (
            item.dropdown ? (
              <DropdownMenu key={item.id}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-stone-800 font-bold px-2 md:px-4 text-xs md:text-sm">
                    {item.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1e1e1e] border-stone-800 text-gray-300 max-h-[300px] overflow-y-auto">
                  {Object.keys(item.dropdown).map(val => (
                    <DropdownMenuItem key={val} onClick={() => {
                      if (item.onSelect) item.onSelect(val);
                      toast.success(`${item.label} changed to ${val}`);
                    }} className="hover:bg-stone-800 focus:bg-stone-800 text-gray-300">
                      {val}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "text-gray-300 hover:text-white hover:bg-stone-800 font-bold px-2 md:px-4 text-xs md:text-sm",
                  (viewMode === 'chord' && item.id === 'chords') || (viewMode === 'scale' && item.id === 'scales') ? "bg-stone-800 text-white" : "",
                  (item as { hidden?: boolean }).hidden ? "hidden" : ""
                )}
                onClick={item.action}
              >
                {item.label}
              </Button>
            )
          ))}
          <div className="flex-grow"></div>

          <Button
            variant={isListening ? "destructive" : "outline"}
            size="sm"
            className={cn(
              "gap-2 font-bold h-8 transition-all",
              isListening ? "animate-pulse" : "bg-[#2a2a2a] border-stone-700 text-gray-300"
            )}
            onClick={() => {
              setIsListening(!isListening);
              if (!isListening) toast.success(t('mic_enabled') || "Microphone enabled. Play your guitar!");
            }}
          >
            {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            <span className="hidden sm:inline">{isListening ? t('stop_listening') || "Stop Listening" : t('connect_guitar') || "Connect Guitar"}</span>
          </Button>

          <div className="flex items-center gap-2 px-2 border-l border-stone-700 ml-2">
            <Label className="text-[10px] text-stone-500 uppercase font-bold hidden md:block">{t('instrument')}</Label>
            <Select value={selectedInstrument} onValueChange={(val) => setSelectedInstrument(val as InstrumentType)}>
              <SelectTrigger className="w-[120px] h-8 bg-[#2a2a2a] border-stone-700 text-xs text-gray-300">
                <SelectValue placeholder={t('instrument')} />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-stone-800 text-gray-300">
                <SelectItem value="guitar">{t('acoustic')}</SelectItem>
                <SelectItem value="clean">{t('clean')}</SelectItem>
                <SelectItem value="distortion">{t('distortion')}</SelectItem>
                <SelectItem value="bass">{t('bass')}</SelectItem>
                <SelectItem value="ukulele">{t('ukulele')}</SelectItem>
                <SelectItem value="piano">{t('piano')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1e1e1e] border-stone-800 text-gray-300">
              <DropdownMenuItem onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}>
                {language === 'en' ? 'RU' : 'EN'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" className="text-red-600 font-bold text-xl" onClick={() => toast.info(t('title'), { description: "Professional music theory dashboard for guitarists and pianists." })}>?</Button>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 landscape:px-2">

        {/* Root Note Selection Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-1 mb-4 landscape:mb-2 landscape:gap-0.5">
          {ALL_NOTES.map((note) => (
            <Button
              key={note}
              variant="outline"
              className={cn(
                "w-10 h-10 md:w-16 md:h-16 text-base md:text-lg font-bold transition-all border-stone-700 bg-[#2a2a2a] text-gray-300 hover:bg-stone-800 hover:text-white",
                "landscape:w-11 landscape:h-11 landscape:text-base",
                selectedRoot === note ? "bg-[#b06a3b] text-white border-[#b06a3b] hover:bg-[#b06a3b]" : ""
              )}
              onClick={() => setSelectedRoot(note)}
            >
              {note}
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-4 landscape:gap-2">
          {(viewMode === 'quiz' || viewMode === 'finder') && (
            <div className="w-full flex justify-center mb-2">
              {viewMode === 'quiz' && (
                <div className="bg-[#1e1e1e] p-4 rounded-lg border border-orange-500 w-full max-w-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <p className="text-white font-bold">{t('find_note_quiz')}:</p>
                    {quizTarget ? (
                      <div className="text-2xl font-bold text-orange-500 animate-pulse">
                        {quizTarget}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">{t('start_quiz_desc')}</span>
                    )}
                  </div>
                  <Button onClick={() => {
                    const notes = ALL_NOTES;
                    const randomNote = notes[Math.floor(Math.random() * notes.length)];
                    setQuizTarget(randomNote);
                  }} className="bg-orange-600 hover:bg-orange-700">
                    {quizTarget ? t('next_note') : t('start_quiz')}
                  </Button>
                </div>
              )}

              {viewMode === 'finder' && (
                <div className="bg-[#1e1e1e] p-4 rounded-lg border border-blue-500 w-full max-w-2xl">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-grow w-full">
                      <Label className="text-white mb-2 block">{t('enter_notes')}</Label>
                      <Input
                        placeholder="C E G"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-stone-800 border-stone-700 text-white"
                      />
                    </div>
                    {searchQuery && (
                      <div className="w-full md:w-64 max-h-[150px] overflow-y-auto bg-black/40 p-2 rounded">
                        <h4 className="text-xs font-semibold text-gray-400 mb-1 uppercase">{t('matching_results')}</h4>
                        <div className="flex flex-col gap-1">
                          {(() => {
                            const notes = searchQuery.split(/[\s,]+/).filter(Boolean);
                            const results = findScalesByNotes(notes);
                            if (results.length === 0) return <p className="text-[10px] text-muted-foreground">{t('no_matches')}</p>;
                            return results.map((res, i) => (
                              <Button
                                key={i}
                                variant="ghost"
                                size="sm"
                                className="justify-start h-7 text-xs text-gray-300 hover:text-white hover:bg-stone-700 px-2"
                                onClick={() => {
                                  setSelectedRoot(res.root);
                                  if (SCALES[res.type as keyof typeof SCALES]) {
                                    setViewMode('scale');
                                    setSelectedScaleName(res.type as keyof typeof SCALES);
                                  } else {
                                    setViewMode('chord');
                                    setSelectedChordName(res.type as keyof typeof CHORDS);
                                  }
                                }}
                              >
                                {res.root} {t(res.type as never)}
                              </Button>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative w-full border border-stone-800 rounded-lg overflow-hidden bg-[#1a1a1a] shadow-inner landscape:max-h-[85vh]">
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
                mode={(viewMode === 'chord' || viewMode === 'scale') ? viewMode : 'scale'}
                onModeChange={(mode) => setViewMode(mode)}
                sampler={samplers.current.piano || null}
                detectedNote={detectedNote}
              />
            ) : (
              <div className="relative">
                <Fretboard
                  selectedRoot={selectedRoot}
                  selectedScaleName={selectedScaleName}
                  selectedChordName={selectedChordName}
                  currentVoicingIndex={currentVoicingIndex}
                  selectedCagedShape={selectedCagedShape}
                  selectedTuningName={selectedTuningName}
                  onTuningChange={setSelectedTuningName}
                  mode={viewMode}
                  onModeChange={setViewMode}
                  instrumentType={selectedInstrument}
                  sampler={samplers.current[selectedInstrument] || null}
                  detectedNote={detectedNote}
                  onNoteClick={(noteName) => {
                    if (viewMode === 'quiz' && quizTarget) {
                      if (noteName === quizTarget) {
                        toast.success("Correct!");
                        setQuizTarget(null);
                      } else {
                        toast.error(`Wrong! That was ${noteName}`);
                      }
                    }
                  }}
                />

                {viewMode === 'notes' && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-8 text-center">
                    <div className="bg-[#1e1e1e] border border-stone-800 p-8 rounded-xl max-w-lg shadow-2xl">
                      <Music className="h-12 w-12 text-[#b06a3b] mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-4">{t('notes')}</h3>
                      <p className="text-gray-400 leading-relaxed mb-6">
                        {t('notes_explanation')}
                      </p>
                      <Button onClick={() => setViewMode('scale')} className="bg-[#b06a3b] hover:bg-[#8e5630]">
                        Got it!
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Display and Playback Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 p-2 md:p-4 landscape:p-2 landscape:gap-2">
            <div className="flex flex-col text-center md:text-left">
              <h2 className="text-xl md:text-3xl font-bold text-[#b06a3b] landscape:text-xl">
                {viewMode === 'chord' ? `${selectedRoot} ${selectedChordName}` : `${selectedRoot} ${t_safe(selectedScaleName)}`}
              </h2>
              <div className="flex flex-col gap-1">
                <p className="text-xs md:text-base text-stone-500 font-mono landscape:text-xs">
                  {activeNotesForArpeggio.join(' • ')}
                </p>
                <p className="text-[10px] md:text-xs text-[#b06a3b] font-bold uppercase tracking-widest bg-[#b06a3b]/10 px-2 py-0.5 rounded self-center md:self-start">
                  {viewMode === 'chord' ? getScaleFormula(CHORDS[selectedChordName]) : viewMode === 'scale' ? getScaleFormula(SCALES[selectedScaleName]) : 'CAGED Shape'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#2a2a2a] p-1 rounded-md border border-stone-700 scale-90 md:scale-100 landscape:scale-90">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300"
                onClick={() => {
                  const voicings = CHORD_VOICINGS[selectedChordName] || CHORD_VOICINGS["Major"];
                  const count = Object.keys(voicings).length;
                  const nextIndex = (currentVoicingIndex - 1 + count) % count;
                  setCurrentVoicingIndex(nextIndex);
                  if (viewMode === 'chord') playCurrent(nextIndex);
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant={isPlaying ? "destructive" : "ghost"}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded font-bold min-w-[150px] justify-center transition-all",
                  isPlaying ? "bg-red-900/40 hover:bg-red-800/60 text-white border border-red-500" : "bg-stone-800 hover:bg-stone-700 text-gray-300"
                )}
                onClick={playCurrent}
              >
                {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Volume2 className="h-5 w-5 mr-2" />}
                {isPlaying ? (t('stop') || 'Pause') : t('play')}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300"
                onClick={() => {
                  const voicings = CHORD_VOICINGS[selectedChordName] || CHORD_VOICINGS["Major"];
                  const count = Object.keys(voicings).length;
                  const nextIndex = (currentVoicingIndex + 1) % count;
                  setCurrentVoicingIndex(nextIndex);
                  if (viewMode === 'chord') playCurrent(nextIndex);
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 landscape:mb-4 landscape:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-16 landscape:h-12 bg-[#2a2a2a] border-stone-700 text-gray-300 font-bold hover:bg-stone-800">
                  <Music className="mr-2 h-5 w-5" /> {viewMode === 'chord' ? t('chordType') : viewMode === 'scale' ? t('scaleMode') : t('cagedShape')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1e1e1e] border-stone-800 text-gray-300 max-h-[300px] overflow-y-auto">
                {viewMode === 'chord'
                  ? Object.keys(CHORDS).map(c => (
                      <DropdownMenuItem key={c} onClick={() => setSelectedChordName(c as keyof typeof CHORDS)} className="hover:bg-stone-800 focus:bg-stone-800">
                        {c}
                      </DropdownMenuItem>
                    ))
                  : viewMode === 'scale'
                  ? Object.keys(SCALES).map(s => (
                      <DropdownMenuItem key={s} onClick={() => setSelectedScaleName(s as keyof typeof SCALES)} className="hover:bg-stone-800 focus:bg-stone-800">
                        {t_safe(s)}
                      </DropdownMenuItem>
                    ))
                  : Object.keys(CAGED_SHAPES).map(sh => (
                      <DropdownMenuItem key={sh} onClick={() => setSelectedCagedShape(sh as keyof typeof CAGED_SHAPES)} className="hover:bg-stone-800 focus:bg-stone-800">
                        Shape {sh}
                      </DropdownMenuItem>
                    ))
                }
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className="h-16 landscape:h-12 bg-[#2a2a2a] border-stone-700 text-gray-300 font-bold hover:bg-stone-800"
              onClick={() => toast.info(viewMode === 'chord' ? `${selectedRoot} ${selectedChordName}: ${activeNotesForArpeggio.join(', ')}` : `${selectedRoot} ${t_safe(selectedScaleName)}: ${activeNotesForArpeggio.join(', ')}`)}
            >
              <Zap className="mr-2 h-5 w-5" /> Info
            </Button>

            <Button variant="outline" className="h-16 landscape:h-12 bg-[#2a2a2a] border-stone-700 text-gray-300 font-bold hover:bg-stone-800" onClick={() => toast.info("Finding recommended scales...")}>
              <Zap className="mr-2 h-5 w-5" /> {t('recScales')}
            </Button>

            <Button variant="outline" className="h-16 landscape:h-12 bg-[#2a2a2a] border-stone-700 text-gray-300 font-bold hover:bg-stone-800" onClick={() => toast.success("Added to Favorites!")}>
              <Zap className="mr-2 h-5 w-5 text-red-500" /> {t('myFav')}
            </Button>
          </div>

          {/* Secondary Tools */}
          <div className="mt-8 pb-24 landscape:mt-4">
            <Tabs defaultValue="theory" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a] border border-stone-800 p-1 mb-6">
                <TabsTrigger value="theory" className="data-[state=active]:bg-[#b06a3b] data-[state=active]:text-white text-gray-400">
                  {t('theoryTools') || 'Theory & Progressions'}
                </TabsTrigger>
                <TabsTrigger value="practice" className="data-[state=active]:bg-[#b06a3b] data-[state=active]:text-white text-gray-400">
                  {t('practiceTools') || 'Rhythm & Practice'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="theory" className="flex flex-col gap-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CircleOfFifths
                    selectedRoot={selectedRoot}
                    onNoteSelect={setSelectedRoot}
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
              </TabsContent>

              <TabsContent value="practice" className="flex flex-col gap-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div ref={arpeggioRef}>
                    <ArpeggioPlayer
                      notes={activeNotesForArpeggio}
                      sampler={samplers.current[selectedInstrument] || samplers.current.piano || null}
                      instrumentType={selectedInstrument}
                    />
                  </div>
                  <Metronome />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <div className="mt-12 pb-8">
      </div>
    </div>
  );
};

export default Index;