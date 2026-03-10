import Fretboard from "@/components/Fretboard";
import Piano from "@/components/Piano";
import CircleOfFifths from "@/components/CircleOfFifths";
import ProgressionGenerator from "@/components/ProgressionGenerator";
import ArpeggioPlayer from "@/components/ArpeggioPlayer";
import Metronome from "@/components/Metronome";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import * as Tone from 'tone';
import { Button } from "@/components/ui/button";
import { Music, Guitar, Piano as PianoIcon, Zap, Volume2, Volume1, VolumeX, Square, Pause, Loader2, ChevronLeft, ChevronRight, Settings, Mic, MicOff, Crown } from "lucide-react";
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
import { ALL_NOTES, SCALES, CHORDS, GENRES, CAGED_SHAPES, CHORD_VOICINGS, getVoicingNotes, GUITAR_TUNINGS, romanToChord, getScaleNotes, getChordNotes, findScalesByNotes, getScaleFormula, getSortedVoicings } from "@/lib/fretboardUtils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAudioInput } from "@/hooks/useAudioInput";
import { useSubscription } from "@/lib/subscription";

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
  "E2": "E2.mp3", "G2": "G2.mp3", "A2": "A2.mp3", "B2": "B2.mp3",
  "C3": "C3.mp3", "D3": "D3.mp3", "Eb3": "Eb3.mp3", "F3": "F3.mp3", "Gb3": "Gb3.mp3", "Ab3": "Ab3.mp3",
  "A3": "A3.mp3", "B3": "B3.mp3", "C4": "C4.mp3", "D4": "D4.mp3", "Eb4": "Eb4.mp3", "F4": "F4.mp3", "Gb4": "Gb4.mp3",
  "A4": "A4.mp3", "B4": "B4.mp3", "C5": "C5.mp3", "D5": "D5.mp3", "Eb5": "Eb5.mp3", "Gb5": "Gb5.mp3",
  "A5": "A5.mp3", "C6": "C6.mp3"
};

const ELECTRIC_GUITAR_URLS = {
  "E2": "E2.mp3", "G2": "G2.mp3", "A2": "A2.mp3", "B2": "B2.mp3",
  "C3": "C3.mp3", "D3": "D3.mp3", "Eb3": "Eb3.mp3", "F3": "F3.mp3", "Gb3": "Gb3.mp3", "Ab3": "Ab3.mp3",
  "A3": "A3.mp3", "B3": "B3.mp3", "C4": "C4.mp3", "D4": "D4.mp3", "Eb4": "Eb4.mp3", "F4": "F4.mp3", "Gb4": "Gb4.mp3",
  "A4": "A4.mp3", "B4": "B4.mp3", "C5": "C5.mp3", "D5": "D5.mp3", "Eb5": "Eb5.mp3", "Gb5": "Gb5.mp3",
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
  const { setShowPaywall, plan } = useSubscription();
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [loadingInstruments, setLoadingInstruments] = useState<Set<InstrumentType>>(new Set());
  const [loadedInstruments, setLoadedInstruments] = useState<Set<InstrumentType>>(new Set());
  const [activeTab, setActiveTab] = useState("theory");
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('guitar');
  const [selectedRoot, setSelectedRoot] = useState<string>("C");
  const [selectedScaleName, setSelectedScaleName] = useState<keyof typeof SCALES>("MAJOR");
  const [selectedChordName, setSelectedChordName] = useState<keyof typeof CHORDS>("Major");
  const [currentVoicingIndex, setCurrentVoicingIndex] = useState(0);
  const [selectedCagedShape, setSelectedCagedShape] = useState<keyof typeof CAGED_SHAPES>("Shape E (Barre)");
  const [selectedTuningName, setSelectedTuningName] = useState<string>("Standard");
  const [viewMode, setViewMode] = useState<'scale' | 'chord' | 'caged' | 'quiz' | 'finder' | 'notes' | 'triads' | 'arpeggios' | 'virtual'>('scale');
  const [activeArpeggioNote, setActiveArpeggioNote] = useState<{ string?: number, fret?: number, noteName?: string } | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [searchQuery, setSearchQuery] = useState('');
  const [quizTarget, setQuizTarget] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('default');
  const { detectedNote, detectedNotes, noteHistory, micError, isSignalPresent, inputLevel, availableDevices, activeDeviceLabel } = useAudioInput(isListening, selectedAudioDevice);
  const { theme, setTheme } = useTheme();

  const samplers = useRef<Partial<Record<InstrumentType, Tone.Sampler>>>({});
  const effectChainsRef = useRef<Partial<Record<InstrumentType, Tone.ToneAudioNode[]>>>({});
  const arpeggioRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const playbackPartRef = useRef<Tone.Part | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Mic error handling
  useEffect(() => {
    if (!micError) return;
    setIsListening(false);
    if (micError === 'mic_denied') {
      toast.error(language === 'ru'
        ? 'Доступ к микрофону запрещён. Разрешите в настройках браузера.'
        : 'Microphone access denied. Please allow in browser settings.');
    } else if (micError === 'mic_not_found') {
      toast.error(language === 'ru'
        ? 'Микрофон не найден. Подключите устройство.'
        : 'No microphone found. Please connect a device.');
    } else {
      toast.error(language === 'ru'
        ? 'Ошибка при подключении микрофона.'
        : 'Error connecting to microphone.');
    }
  }, [micError, language]);

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
    Tone.Transport.stop();
    setIsPlaying(false);
  }, []);

  const playCurrent = useCallback((forceStart: boolean | number | React.MouseEvent = false) => {
    const isForced = forceStart === true || typeof forceStart === 'number';
    if (!isForced && isPlayingRef.current) {
      stopCurrent();
      return;
    }

    const inst = selectedInstrument;
    const currentSampler = samplers.current[inst];
    if (!currentSampler || !currentSampler.loaded || Tone.context.state !== 'running') {
      return;
    }

    // Stop any previous playback
    stopCurrent();

    // --- Chord-based modes: play voicing as a strum ---
    if (viewMode === 'chord' || viewMode === 'triads' || viewMode === 'caged') {
      const tuning = GUITAR_TUNINGS[selectedTuningName as keyof typeof GUITAR_TUNINGS] || GUITAR_TUNINGS.Standard;

      let voicingName = '';
      if (viewMode === 'caged') {
        voicingName = selectedCagedShape;
      } else {
        const voicingNames = getSortedVoicings(selectedRoot, selectedChordName, tuning, viewMode === 'triads' ? 'triads' : 'chord');
        const vIdx = typeof forceStart === 'number' ? forceStart : currentVoicingIndex;
        voicingName = voicingNames[vIdx % voicingNames.length] || voicingNames[0];
      }

      const vNotes = getVoicingNotes(selectedRoot, selectedChordName, voicingName, tuning);
      if (vNotes.length > 0) {
        currentSampler.triggerAttackRelease(vNotes.map(vn => vn.noteWithOctave), "2n");
        setIsPlaying(true);
        setTimeout(() => setIsPlaying(false), 2000);
      }
      return;
    }

    // --- Arpeggios mode: play chord notes one by one ---
    if (viewMode === 'arpeggios') {
      const tuning = GUITAR_TUNINGS[selectedTuningName as keyof typeof GUITAR_TUNINGS] || GUITAR_TUNINGS.Standard;
      const voicingNames = getSortedVoicings(selectedRoot, selectedChordName, tuning, 'chord');
      const vName = voicingNames[currentVoicingIndex % voicingNames.length] || voicingNames[0];
      const vNotes = getVoicingNotes(selectedRoot, selectedChordName, vName, tuning);

      if (vNotes.length > 0) {
        const sorted = [...vNotes].sort((a, b) => {
          const octA = parseInt(a.noteWithOctave.match(/\d+/)?.[0] || '3');
          const octB = parseInt(b.noteWithOctave.match(/\d+/)?.[0] || '3');
          if (octA !== octB) return octA - octB;
          return ALL_NOTES.indexOf(a.noteName) - ALL_NOTES.indexOf(b.noteName);
        });

        const partEvents = sorted.map((vn, i) => ({ time: i * 0.2, note: vn.noteWithOctave, noteName: vn.noteName, string: vn.string, fret: vn.fret }));

        if (playbackPartRef.current) playbackPartRef.current.dispose();
        playbackPartRef.current = new Tone.Part((time, event) => {
          currentSampler.triggerAttackRelease(event.note, "8n", time);
          Tone.Draw.schedule(() => {
            setActiveArpeggioNote({ noteName: event.noteName, string: event.string, fret: event.fret });
          }, time);
        }, partEvents).start(0);

        const duration = partEvents.length * 0.2;
        setIsPlaying(true);

        if (Tone.Transport.state !== 'started') Tone.Transport.start();

        stopTimeoutRef.current = Tone.Transport.scheduleOnce(() => {
          setIsPlaying(false);
          setActiveArpeggioNote(null);
          stopTimeoutRef.current = null;
        }, `+${duration + 0.5}`);
      }
      return;
    }

    // --- Scale mode and all other modes: play scale sequentially ---
    const notes = getScaleNotes(selectedRoot, SCALES[selectedScaleName]);
    if (notes.length === 0) return;

    let currentOctave = inst === 'bass' ? 1 : inst === 'ukulele' ? 4 : 3;
    let lastIdx = -1;
    const playNotes = notes.map(n => {
      const idx = ALL_NOTES.indexOf(n);
      if (idx < lastIdx) currentOctave++;
      lastIdx = idx;
      return `${n}${currentOctave}`;
    });

    // Add the root note an octave higher at the end for completion
    const rootIdx = ALL_NOTES.indexOf(notes[0]);
    let finalOctave = currentOctave;
    if (rootIdx < lastIdx) finalOctave++;
    playNotes.push(`${notes[0]}${finalOctave}`);

    if (playbackPartRef.current) playbackPartRef.current.dispose();

    const partEvents = playNotes.map((note, i) => ({ time: i * 0.25, note }));

    playbackPartRef.current = new Tone.Part((time, event) => {
      currentSampler.triggerAttackRelease(event.note, "8n", time);
    }, partEvents).start(0);

    const duration = partEvents.length * 0.25;
    setIsPlaying(true);

    if (Tone.Transport.state !== 'started') Tone.Transport.start();

    stopTimeoutRef.current = Tone.Transport.scheduleOnce(() => {
      setIsPlaying(false);
      stopTimeoutRef.current = null;
    }, `+${duration + 0.5}`);
  }, [selectedInstrument, selectedRoot, selectedChordName, currentVoicingIndex, selectedScaleName, viewMode, selectedCagedShape, stopCurrent, selectedTuningName]);

  // Reset voicing index when chord name changes
  useEffect(() => {
    setCurrentVoicingIndex(0);
  }, [selectedChordName]);

  // Auto-play when root or type changed (only if instrument is loaded)
  useEffect(() => {
    if ((viewMode === 'chord' || viewMode === 'scale') && isAudioEnabled && loadedInstruments.has(selectedInstrument)) {
      playCurrent(true);
    }
  }, [selectedRoot, selectedChordName, selectedScaleName, viewMode, isAudioEnabled, playCurrent, loadedInstruments, selectedInstrument]);

  useEffect(() => {
    const currentSamplers = samplers.current;
    const currentEffects = effectChainsRef.current;
    return () => {
      Object.values(currentSamplers).forEach(s => s?.dispose());
      Object.values(currentEffects).forEach(chain => chain?.forEach(e => e.dispose()));
    };
  }, []);

  useEffect(() => {
    Tone.Destination.volume.value = Tone.gainToDb(volume);
  }, [volume]);

  const loadInstrument = useCallback(async (inst: InstrumentType) => {
    if (loadedInstruments.has(inst) || loadingInstruments.has(inst)) return;

    setLoadingInstruments(prev => new Set(prev).add(inst));

    try {
      let urls: Record<string, string>;
      let baseUrl = "";

      switch (inst) {
        case 'piano':
          urls = PIANO_URLS;
          baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/";
          break;
        case 'guitar':
          urls = GUITAR_URLS;
          baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_guitar_nylon-mp3/";
          break;
        case 'clean':
          urls = ELECTRIC_GUITAR_URLS;
          baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/electric_guitar_clean-mp3/";
          break;
        case 'distortion':
          urls = ELECTRIC_GUITAR_URLS;
          baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/electric_guitar_clean-mp3/";
          break;
        case 'bass':
          urls = BASS_URLS;
          baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/electric_bass_finger-mp3/";
          break;
        case 'ukulele':
          urls = UKULELE_URLS;
          baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_guitar_nylon-mp3/";
          break;
        default:
          urls = GUITAR_URLS;
          baseUrl = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_guitar_nylon-mp3/";
      }

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timeout loading samples")), 30000);

        const sampler = new Tone.Sampler({
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
        });

        // Dispose previous effects if reloading
        if (effectChainsRef.current[inst]) {
          effectChainsRef.current[inst]!.forEach(e => e.dispose());
          delete effectChainsRef.current[inst];
        }

        // Apply instrument-specific audio effects chain
        if (inst === 'distortion') {
          const drive = new Tone.Distortion({ distortion: 0.7, oversample: '4x' });
          const cabFilter = new Tone.Filter({ frequency: 4500, type: 'lowpass', rolloff: -24 });
          const midBoost = new Tone.EQ3({ low: -3, mid: 5, high: -6 });
          const reverb = new Tone.Freeverb({ roomSize: 0.2, dampening: 4000 });
          reverb.wet.value = 0.15;
          sampler.chain(drive, cabFilter, midBoost, reverb, Tone.Destination);
          effectChainsRef.current[inst] = [drive, cabFilter, midBoost, reverb];
        } else if (inst === 'clean') {
          const chorus = new Tone.Chorus({ frequency: 3.5, delayTime: 2.5, depth: 0.4 }).start();
          chorus.wet.value = 0.3;
          const reverb = new Tone.Freeverb({ roomSize: 0.35, dampening: 5000 });
          reverb.wet.value = 0.2;
          sampler.chain(chorus, reverb, Tone.Destination);
          effectChainsRef.current[inst] = [chorus, reverb];
        } else {
          sampler.toDestination();
        }

        samplers.current[inst] = sampler;
      });

      setLoadedInstruments(prev => new Set(prev).add(inst));
    } catch (e) {
      console.error(`Error loading instrument ${inst}:`, e);
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

  const activeNotesForArpeggio = useMemo(() => {
    // If in chord/caged/triad/arpeggios mode, use specific voicing if possible
    if (viewMode === 'chord' || viewMode === 'triads' || viewMode === 'caged' || viewMode === 'arpeggios') {
      const tuning = GUITAR_TUNINGS[selectedTuningName as keyof typeof GUITAR_TUNINGS] || GUITAR_TUNINGS.Standard;

      let vName = '';
      if (viewMode === 'caged') {
        vName = selectedCagedShape;
      } else {
        const voicingNames = getSortedVoicings(selectedRoot, selectedChordName, tuning, viewMode === 'triads' ? 'triads' : 'chord');
        vName = voicingNames[currentVoicingIndex % voicingNames.length] || voicingNames[0];
      }

      const vNotes = getVoicingNotes(selectedRoot, selectedChordName, vName, tuning);
      if (vNotes.length > 0) {
        return vNotes.map(vn => ({
          noteName: vn.noteName,
          string: vn.string,
          fret: vn.fret,
          noteWithOctave: vn.noteWithOctave
        }));
      }
      return getChordNotes(selectedRoot, CHORDS[selectedChordName] || CHORDS.Major);
    }
    // Default fallback: return chord notes for the current root
    return getChordNotes(selectedRoot, CHORDS[selectedChordName] || CHORDS.Major);
  }, [viewMode, selectedRoot, selectedChordName, currentVoicingIndex, selectedTuningName, selectedCagedShape]);

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
    <div className="min-h-[100dvh] flex flex-col items-center justify-start bg-[#121212] transition-colors duration-300">
      {/* Top Navigation Bar */}
      <div className="w-full bg-[#1e1e1e] border-b border-stone-800 px-2 md:px-4 py-1.5 md:py-2 mb-2 md:mb-4 overflow-x-auto safe-area-top">
        <div className="flex items-center gap-0.5 md:gap-4 min-w-max">
          {[
            {
              id: 'chords', label: t('chords'), action: () => {
                setViewMode('chord');
                setCurrentVoicingIndex(0);
              }
            },
            {
              id: 'triads', label: t('triads'), action: () => {
                setViewMode('triads');
                setCurrentVoicingIndex(0);
                toast.info(`${selectedRoot} Triads active`);
              }
            },
            {
              id: 'caged', label: t('caged'), action: () => {
                setViewMode('caged');
                setCurrentVoicingIndex(0);
                toast.info(`${selectedRoot} CAGED Shapes active`);
              }, hidden: selectedInstrument === 'ukulele'
            },
            { id: 'quiz', label: t('quiz'), action: () => setViewMode('quiz') },
            { id: 'finder', label: t('finder'), action: () => setViewMode('finder') },
            { id: 'scales', label: t('scales'), action: () => setViewMode('scale') },
            {
              id: 'arpeggios', label: t('arpeggios'), action: () => {
                setViewMode('arpeggios');
                setActiveTab("practice");
                setTimeout(() => arpeggioRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                toast.info("Arpeggiator");
              }
            },
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
                <DropdownMenuContent className="bg-[#1e1e1e] border-stone-800 text-gray-300 max-h-[40vh] overflow-y-auto">
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
                data-testid={`mode-btn-${item.id}`}
                variant="ghost"
                className={cn(
                  "text-gray-300 hover:text-white hover:bg-stone-800 font-bold px-2 md:px-4 text-xs md:text-sm",
                  (viewMode === 'chord' && item.id === 'chords' && !Object.keys(CHORD_VOICINGS[selectedChordName!] || {})[currentVoicingIndex]?.toLowerCase().includes('triad')) ||
                    (viewMode === 'chord' && item.id === 'triads' && Object.keys(CHORD_VOICINGS[selectedChordName!] || {})[currentVoicingIndex]?.toLowerCase().includes('triad')) ||
                    (viewMode === 'scale' && item.id === 'scales') ||
                    (viewMode === item.id) ? "bg-stone-800 text-white" : "",
                  (item as { hidden?: boolean }).hidden ? "hidden" : ""
                )}
                onClick={item.action}
              >
                {item.label}
              </Button>
            )
          ))}
          <div className="flex-grow"></div>

          {/* Guitar input feature temporarily disabled
          <div className="flex items-center gap-1">
            {isListening && availableDevices.length > 1 && (
              <Select value={selectedAudioDevice} onValueChange={(val) => {
                setSelectedAudioDevice(val);
                setIsListening(false);
                setTimeout(() => setIsListening(true), 100);
              }}>
                <SelectTrigger className="w-[140px] h-8 bg-[#2a2a2a] border-stone-700 text-[10px] text-gray-300">
                  <SelectValue placeholder={language === 'ru' ? 'Источник' : 'Input'} />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-stone-800 text-gray-300">
                  <SelectItem value="default" className="text-xs">
                    {language === 'ru' ? 'По умолчанию' : 'Default'}
                  </SelectItem>
                  {availableDevices.map(d => (
                    <SelectItem key={d.deviceId} value={d.deviceId} className="text-xs">
                      {d.label.length > 30 ? d.label.slice(0, 30) + '...' : d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              className={cn(
                "gap-2 font-bold h-8 transition-all",
                isListening ? "animate-pulse" : "bg-[#2a2a2a] border-stone-700 text-gray-300"
              )}
              onClick={() => {
                const next = !isListening;
                setIsListening(next);
                if (next) toast.success(t('mic_enabled') || "Microphone enabled. Play your guitar!");
              }}
            >
              {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              <span className="hidden sm:inline">{isListening ? t('stop_listening') || "Stop Listening" : t('connect_guitar') || "Connect Guitar"}</span>
            </Button>
          </div>
          */}

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
          {plan === 'free' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[#b06a3b] hover:text-[#d4844a] font-bold gap-1"
              onClick={() => setShowPaywall(true)}
            >
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Pro</span>
            </Button>
          )}
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 landscape:px-2">

        {/* Root Note Selection Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-1 mb-2 md:mb-4">
          {ALL_NOTES.map((note) => (
            <Button
              key={note}
              variant="outline"
              className={cn(
                "w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 text-sm sm:text-base md:text-lg font-bold transition-all border-stone-700 bg-[#2a2a2a] text-gray-300 hover:bg-stone-800 hover:text-white p-0",
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
                  onCagedShapeChange={setSelectedCagedShape}
                  selectedTuningName={selectedTuningName}
                  onTuningChange={setSelectedTuningName}
                  mode={viewMode}
                  onModeChange={setViewMode}
                  instrumentType={selectedInstrument}
                  sampler={samplers.current[selectedInstrument] || null}
                  detectedNotes={detectedNotes}
                  noteHistory={noteHistory}
                  isListening={isListening}
                  activeArpeggioNote={activeArpeggioNote}
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

          {/* Detected Note Indicator (Tuner Display) */}
          {isListening && (
            <div className="w-full bg-[#1a1a1a] border border-stone-800 rounded-lg my-2 transition-all overflow-hidden">
              {/* Device info + signal level bar */}
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-stone-800/50 bg-stone-900/30">
                <Mic className={cn("h-3.5 w-3.5 shrink-0", isSignalPresent ? "text-green-400" : "text-stone-600")} />
                <span className="text-[10px] text-stone-500 truncate flex-1">
                  {activeDeviceLabel || (language === 'ru' ? 'Подключение...' : 'Connecting...')}
                </span>
                {/* Input level meter */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] text-stone-600 font-mono">{language === 'ru' ? 'СИГНАЛ' : 'LEVEL'}</span>
                  <div className="flex gap-[1px] items-end h-3">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const threshold = (i + 1) / 12;
                      const isLit = inputLevel >= threshold;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "w-[3px] rounded-sm transition-all duration-75",
                            isLit
                              ? (i >= 10 ? "bg-red-400" : i >= 7 ? "bg-yellow-400" : "bg-green-400")
                              : "bg-stone-800"
                          )}
                          style={{ height: `${4 + i}px` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Main tuner section */}
              <div className="p-3 flex items-center justify-center gap-3 md:gap-6">
                {detectedNotes.length > 0 ? (
                  <>
                    {/* All detected notes display */}
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {detectedNotes.map((dn, idx) => (
                        <div key={`${dn.note}-${idx}`} className="flex items-baseline gap-0.5">
                          <span className={cn(
                            "font-black tracking-tight drop-shadow-[0_0_10px_rgba(250,204,21,0.4)] transition-all",
                            detectedNotes.length === 1 ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl",
                            "text-yellow-400"
                          )}>
                            {dn.name}
                          </span>
                          <span className={cn(
                            "font-bold text-yellow-400/50",
                            detectedNotes.length === 1 ? "text-lg" : "text-sm"
                          )}>
                            {dn.octave}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Info for primary note */}
                    {detectedNote && (
                      <div className="flex flex-col items-center gap-1">
                        {/* Chord indicator */}
                        {detectedNotes.length > 1 && (
                          <span className="text-[10px] font-bold text-yellow-400/70 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                            {detectedNotes.length} {language === 'ru' ? 'нот' : 'notes'}
                          </span>
                        )}
                        <span className="text-xs font-mono text-stone-400">
                          {detectedNote.frequency} Hz
                        </span>
                        {/* Cents for primary */}
                        <div className="flex items-center gap-1">
                          <div className="flex gap-[2px] items-end">
                            {Array.from({ length: 11 }).map((_, i) => {
                              const barCents = (i - 5) * 10;
                              const isCenter = i === 5;
                              const isActive = Math.abs(detectedNote.cents - barCents) <= 8;
                              return (
                                <div
                                  key={i}
                                  className={cn(
                                    "w-[2px] rounded-sm transition-all duration-100",
                                    isActive
                                      ? (Math.abs(detectedNote.cents) <= 8 ? "bg-green-400" : Math.abs(detectedNote.cents) <= 20 ? "bg-yellow-400" : "bg-red-400")
                                      : (isCenter ? "bg-stone-600" : "bg-stone-800")
                                  )}
                                  style={{ height: `${isActive ? 14 : (isCenter ? 12 : 8)}px` }}
                                />
                              );
                            })}
                          </div>
                          <span className={cn(
                            "text-[9px] font-mono font-bold",
                            Math.abs(detectedNote.cents) <= 8 ? "text-green-400" : "text-yellow-400"
                          )}>
                            {detectedNote.cents > 0 ? '+' : ''}{detectedNote.cents}¢
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-stone-500 py-1">
                    <div className="flex items-center gap-3">
                      <div className={cn("relative", isSignalPresent && "animate-pulse")}>
                        <Mic className="h-5 w-5" />
                        {isSignalPresent && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />}
                      </div>
                      <span className="text-sm">
                        {isSignalPresent
                          ? (language === 'ru' ? 'Сигнал есть, но ноты не определены...' : 'Signal detected, analyzing...')
                          : (language === 'ru' ? 'Нет сигнала. Играйте на гитаре' : 'No signal. Play your guitar')}
                      </span>
                    </div>
                    {!isSignalPresent && inputLevel < 0.01 && (
                      <p className="text-[10px] text-stone-600 text-center max-w-sm">
                        {language === 'ru'
                          ? 'Если подключена звуковая карта — выберите её в выпадающем меню рядом с кнопкой «Подключить гитару».'
                          : 'If using an audio interface — select it from the dropdown next to "Connect Guitar".'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Note history trail */}
              {noteHistory.length > 0 && (
                <div className="border-t border-stone-800/50 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-[9px] text-stone-600 font-bold uppercase tracking-wider shrink-0">
                    {language === 'ru' ? 'Последние:' : 'Recent:'}
                  </span>
                  {noteHistory.map((h, i) => (
                    <span
                      key={`${h.note}-${h.timestamp}-${i}`}
                      className="text-xs font-bold px-1.5 py-0.5 rounded bg-cyan-900/30 text-cyan-300 shrink-0 transition-opacity"
                      style={{ opacity: Math.max(0.2, 1 - h.age) }}
                    >
                      {h.name}{h.octave}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info Display and Playback Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 p-2 md:p-4 landscape:p-2 landscape:gap-2">
            <div className="flex flex-col text-center md:text-left">
              <h2 className="text-xl md:text-3xl font-bold text-[#b06a3b] landscape:text-xl">
                {viewMode === 'chord' ? `${selectedRoot} ${selectedChordName}` :
                  viewMode === 'triads' ? `${selectedRoot} ${selectedChordName} (Triad)` :
                    viewMode === 'caged' ? `${selectedRoot} ${selectedChordName} (CAGED)` :
                      viewMode === 'arpeggios' ? `${selectedRoot} ${selectedChordName} (Arpeggio)` :
                        `${selectedRoot} ${t_safe(selectedScaleName)}`}
              </h2>
              <div className="flex flex-col gap-1">
                <p className="text-xs md:text-base text-stone-500 font-mono landscape:text-xs">
                  {activeNotesForArpeggio.map(n => typeof n === 'string' ? n : n.noteName).join(' • ')}
                </p>
                <p className="text-[10px] md:text-xs text-[#b06a3b] font-bold uppercase tracking-widest bg-[#b06a3b]/10 px-2 py-0.5 rounded self-center md:self-start">
                  {viewMode === 'chord' || viewMode === 'triads' || viewMode === 'caged' || viewMode === 'arpeggios' ? getScaleFormula(CHORDS[selectedChordName]) : getScaleFormula(SCALES[selectedScaleName])}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#2a2a2a] p-1 rounded-md border border-stone-700 scale-90 md:scale-100 landscape:scale-90">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300"
                onClick={() => {
                  const tuning = GUITAR_TUNINGS[selectedTuningName as keyof typeof GUITAR_TUNINGS] || GUITAR_TUNINGS.Standard;
                  const voicingNames = getSortedVoicings(selectedRoot, selectedChordName!, tuning, viewMode === 'triads' ? 'triads' : viewMode === 'caged' ? 'caged' : 'chord');
                  const count = voicingNames.length || 1;
                  const nextIndex = (currentVoicingIndex - 1 + count) % count;
                  setCurrentVoicingIndex(nextIndex);
                  if (viewMode === 'chord' || viewMode === 'triads') playCurrent(nextIndex);
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
                  const tuning = GUITAR_TUNINGS[selectedTuningName as keyof typeof GUITAR_TUNINGS] || GUITAR_TUNINGS.Standard;
                  const voicingNames = getSortedVoicings(selectedRoot, selectedChordName!, tuning, viewMode === 'triads' ? 'triads' : viewMode === 'caged' ? 'caged' : 'chord');
                  const count = voicingNames.length || 1;
                  const nextIndex = (currentVoicingIndex + 1) % count;
                  setCurrentVoicingIndex(nextIndex);
                  if (viewMode === 'chord' || viewMode === 'triads') playCurrent(nextIndex);
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
            {/* Scale/Mode selector - always available */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={cn(
                  "h-12 md:h-16 bg-[#2a2a2a] border-stone-700 text-gray-300 font-bold hover:bg-stone-800 overflow-hidden text-[11px] md:text-sm",
                  viewMode === 'scale' && "border-[#b06a3b]/50"
                )}>
                  <Music className="mr-2 h-5 w-5 shrink-0" />
                  <span className="truncate">{t('scaleMode')}: {t_safe(selectedScaleName)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1e1e1e] border-stone-800 text-gray-300 max-h-[40vh] overflow-y-auto">
                {Object.keys(SCALES).map(s => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => {
                      setSelectedScaleName(s as keyof typeof SCALES);
                      setCurrentVoicingIndex(0);
                      if (viewMode !== 'scale') setViewMode('scale');
                    }}
                    className={cn(
                      "hover:bg-stone-800 focus:bg-stone-800",
                      selectedScaleName === s && "text-[#b06a3b] font-bold"
                    )}
                  >
                    {t_safe(s)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Chord type selector - always available */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={cn(
                  "h-12 md:h-16 bg-[#2a2a2a] border-stone-700 text-gray-300 font-bold hover:bg-stone-800 overflow-hidden text-[11px] md:text-sm",
                  (viewMode === 'chord' || viewMode === 'triads' || viewMode === 'arpeggios') && "border-[#b06a3b]/50"
                )}>
                  <Zap className="mr-2 h-5 w-5 shrink-0" />
                  <span className="truncate">{t('chordType')}: {t_safe(selectedChordName)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1e1e1e] border-stone-800 text-gray-300 max-h-[40vh] overflow-y-auto">
                {Object.keys(CHORDS).map(c => (
                  <DropdownMenuItem
                    key={c}
                    onClick={() => {
                      setSelectedChordName(c as keyof typeof CHORDS);
                      setCurrentVoicingIndex(0);
                    }}
                    className={cn(
                      "hover:bg-stone-800 focus:bg-stone-800",
                      selectedChordName === c && "text-[#b06a3b] font-bold"
                    )}
                  >
                    {t_safe(c)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" className="h-12 md:h-16 bg-[#2a2a2a] border-stone-700 text-gray-300 font-bold hover:bg-stone-800 text-[11px] md:text-sm" onClick={() => toast.info("Finding recommended scales...")}>
              <Zap className="mr-2 h-4 w-4 md:h-5 md:w-5" /> {t('recScales')}
            </Button>

            <Button variant="outline" className="h-12 md:h-16 bg-[#2a2a2a] border-stone-700 text-gray-300 font-bold hover:bg-stone-800 text-[11px] md:text-sm" onClick={() => toast.success("Added to Favorites!")}>
              <Zap className="mr-2 h-4 w-4 md:h-5 md:w-5 text-red-500" /> {t('myFav')}
            </Button>
          </div>

          {/* Secondary Tools */}
          <div className="mt-8 pb-24 landscape:mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                      onNotePlay={setActiveArpeggioNote}
                      positions={(() => {
                        const tuning = GUITAR_TUNINGS[selectedTuningName as keyof typeof GUITAR_TUNINGS] || GUITAR_TUNINGS.Standard;
                        const voicingNames = getSortedVoicings(selectedRoot, selectedChordName, tuning, 'chord');
                        return voicingNames.map((name, idx) => {
                          const vNotes = getVoicingNotes(selectedRoot, selectedChordName, name, tuning);
                          const minFret = vNotes.length > 0 ? Math.min(...vNotes.map(n => n.fret)) : 0;
                          return { label: name.replace('Shape ', '').replace(' (Barre)', ' B'), fret: minFret, index: idx };
                        });
                      })()}
                      currentPositionIndex={currentVoicingIndex}
                      onPositionChange={(idx) => setCurrentVoicingIndex(idx)}
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