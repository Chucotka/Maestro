import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Mic, Volume2, VolumeX } from 'lucide-react';
import type { DetectedNote } from '@/hooks/useAudioInput';

interface GuitarTunerProps {
  tuningName: string;
  tuningNotes: string[];
  detectedNote: DetectedNote | null;
  isListening: boolean;
  isSignalPresent: boolean;
  inputLevel: number;
  language: string;
  instrumentType: string;
  monitorEnabled?: boolean;
  onMonitorToggle?: () => void;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const noteToMidi = (noteStr: string): number => {
  const match = noteStr.match(/([A-G]#?)(\d+)/);
  if (!match) return 0;
  const noteIdx = NOTE_NAMES.indexOf(match[1]);
  const octave = parseInt(match[2], 10);
  return (octave + 1) * 12 + noteIdx;
};

export const GuitarTuner = ({
  tuningName,
  tuningNotes,
  detectedNote,
  isListening,
  isSignalPresent,
  inputLevel,
  language,
  instrumentType,
  monitorEnabled = false,
  onMonitorToggle,
}: GuitarTunerProps) => {
  // Reverse so string 1 (highest) is at top
  const strings = useMemo(() => {
    return tuningNotes.map((note, i) => {
      const stringNum = tuningNotes.length - i;
      const noteName = note.match(/[A-G]#?/)?.[0] || '';
      const octave = note.match(/\d+/)?.[0] || '';
      const midi = noteToMidi(note);
      return { stringNum, noteName, octave, fullNote: note, midi };
    }).reverse();
  }, [tuningNotes]);

  // Find closest target string to detected note
  const closestString = useMemo(() => {
    if (!detectedNote) return null;
    let best = strings[0];
    let bestDist = Infinity;
    for (const s of strings) {
      const dist = Math.abs(detectedNote.note - s.midi);
      if (dist < bestDist) {
        bestDist = dist;
        best = s;
      }
    }
    // Only match if within 3 semitones
    if (bestDist > 3) return null;
    return best;
  }, [detectedNote, strings]);

  const centsOffset = detectedNote?.cents ?? 0;
  const isInTune = closestString && Math.abs(centsOffset) <= 5;
  const semitoneDiff = closestString && detectedNote
    ? detectedNote.note - closestString.midi
    : 0;

  // String label based on instrument
  const getInstrumentLabel = () => {
    if (instrumentType === 'bass') return language === 'ru' ? 'Бас-гитара' : 'Bass Guitar';
    if (instrumentType === 'ukulele') return language === 'ru' ? 'Укулеле' : 'Ukulele';
    return language === 'ru' ? 'Гитара' : 'Guitar';
  };

  return (
    <div className="w-full bg-[#1a1a1a] border border-stone-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-stone-800/50 bg-stone-900/30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            {language === 'ru' ? 'Тюнер' : 'Tuner'}
          </span>
          <span className="text-[10px] text-stone-500">•</span>
          <span className="text-[10px] text-stone-500">{getInstrumentLabel()}</span>
        </div>
        <div className="flex items-center gap-2">
          {isListening && onMonitorToggle && (
            <button
              onClick={onMonitorToggle}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-colors",
                monitorEnabled ? "text-green-400 bg-green-400/10" : "text-stone-500 hover:text-stone-300"
              )}
              title={monitorEnabled ? (language === 'ru' ? 'Выключить звук' : 'Mute') : (language === 'ru' ? 'Включить звук' : 'Enable sound')}
            >
              {monitorEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              {monitorEnabled ? (language === 'ru' ? 'Звук вкл' : 'Sound on') : (language === 'ru' ? 'Звук выкл' : 'Sound off')}
            </button>
          )}
          <span className="text-xs text-[#b06a3b] font-bold">{tuningName}</span>
        </div>
      </div>

      {!isListening ? (
        <div className="p-8 flex flex-col items-center gap-3 text-stone-500">
          <Mic className="h-8 w-8 opacity-40" />
          <p className="text-sm text-center">
            {language === 'ru'
              ? 'Нажмите «Подключить гитару» для запуска тюнера'
              : 'Press "Connect Guitar" to start the tuner'}
          </p>
        </div>
      ) : (
        <div className="p-3 md:p-4">
          {/* Big note display */}
          <div className="flex flex-col items-center gap-2 mb-4">
            {detectedNote && closestString ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "text-6xl md:text-7xl font-black tracking-tight transition-colors duration-200",
                    isInTune ? "text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" :
                    Math.abs(centsOffset) <= 20 ? "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" :
                    "text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.4)]"
                  )}>
                    {detectedNote.name}
                  </span>
                  <span className={cn(
                    "text-2xl font-bold opacity-50",
                    isInTune ? "text-green-400" : Math.abs(centsOffset) <= 20 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {detectedNote.octave}
                  </span>
                </div>

                {/* Target indicator */}
                {semitoneDiff !== 0 && (
                  <span className="text-xs text-stone-400">
                    {language === 'ru' ? 'Цель' : 'Target'}: <span className="text-[#b06a3b] font-bold">{closestString.noteName}{closestString.octave}</span>
                    {' '}({language === 'ru' ? 'струна' : 'string'} {closestString.stringNum})
                  </span>
                )}

                {/* Cents gauge */}
                <div className="w-full max-w-xs mt-1">
                  <div className="relative h-8 flex items-center">
                    {/* Background bar */}
                    <div className="absolute inset-x-0 h-1 bg-stone-800 rounded-full" />
                    {/* Center mark */}
                    <div className="absolute left-1/2 -translate-x-[0.5px] w-[2px] h-4 bg-stone-500 rounded-full" />
                    {/* Ticks */}
                    {[-40, -30, -20, -10, 10, 20, 30, 40].map(c => (
                      <div
                        key={c}
                        className="absolute w-[1px] h-2 bg-stone-700"
                        style={{ left: `${50 + (c / 50) * 45}%` }}
                      />
                    ))}
                    {/* Active indicator */}
                    <div
                      className={cn(
                        "absolute w-3 h-3 rounded-full -translate-x-1/2 transition-all duration-150 shadow-lg",
                        isInTune ? "bg-green-400 shadow-green-400/50" :
                        Math.abs(centsOffset) <= 20 ? "bg-yellow-400 shadow-yellow-400/50" :
                        "bg-red-400 shadow-red-400/50"
                      )}
                      style={{ left: `${50 + (Math.max(-50, Math.min(50, centsOffset)) / 50) * 45}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-stone-600 font-mono px-1">
                    <span>-50¢</span>
                    <span className={cn(
                      "font-bold text-xs",
                      isInTune ? "text-green-400" : Math.abs(centsOffset) <= 20 ? "text-yellow-400" : "text-red-400"
                    )}>
                      {centsOffset > 0 ? '+' : ''}{centsOffset}¢
                    </span>
                    <span>+50¢</span>
                  </div>
                </div>

                {/* In tune celebration */}
                {isInTune && (
                  <div className="text-green-400 text-sm font-bold mt-1 animate-pulse">
                    ✓ {language === 'ru' ? 'Настроено!' : 'In Tune!'}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className={cn("relative", isSignalPresent && "animate-pulse")}>
                  <Mic className={cn("h-6 w-6", isSignalPresent ? "text-green-400" : "text-stone-600")} />
                  {isSignalPresent && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />}
                </div>
                <span className="text-sm text-stone-500">
                  {isSignalPresent
                    ? (language === 'ru' ? 'Анализ сигнала...' : 'Analyzing signal...')
                    : (language === 'ru' ? 'Играйте на гитаре' : 'Play a string')}
                </span>
              </div>
            )}
          </div>

          {/* String indicators */}
          <div className={cn(
            "grid gap-1.5",
            strings.length <= 4 ? "grid-cols-4" :
            strings.length <= 6 ? "grid-cols-6" :
            strings.length <= 7 ? "grid-cols-7" : "grid-cols-8"
          )}>
            {strings.map((s) => {
              const isActive = closestString?.stringNum === s.stringNum && detectedNote !== null;
              const isTarget = isActive && isInTune;

              return (
                <div
                  key={s.stringNum}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg border transition-all duration-200",
                    isTarget
                      ? "bg-green-400/10 border-green-400/50 shadow-[0_0_12px_rgba(74,222,128,0.15)]"
                      : isActive
                        ? "bg-yellow-400/10 border-yellow-400/30"
                        : "bg-stone-900/50 border-stone-800/50"
                  )}
                >
                  <span className="text-[9px] text-stone-600 font-mono">
                    {s.stringNum}
                  </span>
                  <span className={cn(
                    "text-lg md:text-xl font-black transition-colors",
                    isTarget ? "text-green-400" :
                    isActive ? "text-yellow-400" :
                    "text-stone-400"
                  )}>
                    {s.noteName}
                  </span>
                  <span className={cn(
                    "text-[10px] font-mono",
                    isTarget ? "text-green-400/60" :
                    isActive ? "text-yellow-400/60" :
                    "text-stone-600"
                  )}>
                    {s.octave}
                  </span>
                  {/* Mini tuning indicator per string */}
                  {isActive && (
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mt-0.5",
                      isTarget ? "bg-green-400" :
                      Math.abs(centsOffset) <= 20 ? "bg-yellow-400" : "bg-red-400"
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Level meter mini */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[9px] text-stone-600 font-mono">{language === 'ru' ? 'СИГНАЛ' : 'LEVEL'}</span>
            <div className="flex gap-[1px] items-end h-2.5">
              {Array.from({ length: 16 }).map((_, i) => {
                const threshold = (i + 1) / 16;
                const isLit = inputLevel >= threshold;
                return (
                  <div
                    key={i}
                    className={cn(
                      "w-[3px] rounded-sm transition-all duration-75",
                      isLit
                        ? (i >= 13 ? "bg-red-400" : i >= 10 ? "bg-yellow-400" : "bg-green-400")
                        : "bg-stone-800"
                    )}
                    style={{ height: `${3 + i * 0.5}px` }}
                  />
                );
              })}
            </div>
            {detectedNote && (
              <span className="text-[9px] text-stone-500 font-mono ml-2">
                {detectedNote.frequency.toFixed(1)} Hz
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
