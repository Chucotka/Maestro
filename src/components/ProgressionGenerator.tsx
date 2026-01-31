import React, { useState } from 'react';
import { GENRES, romanToChord, CHORDS } from '@/lib/fretboardUtils';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface ProgressionGeneratorProps {
  selectedRoot: string;
  onChordSelect: (root: string, type: keyof typeof CHORDS) => void;
}

const ProgressionGenerator: React.FC<ProgressionGeneratorProps> = ({ selectedRoot, onChordSelect }) => {
  const { t } = useI18n();
  const [selectedGenre, setSelectedGenre] = useState<keyof typeof GENRES>("Pop / Ballad");
  const [currentProgression, setCurrentProgression] = useState<string[]>([]);

  const generateProgression = () => {
    const genreData = GENRES[selectedGenre];
    const randomProg = genreData.progressions[Math.floor(Math.random() * genreData.progressions.length)];
    setCurrentProgression(randomProg);
  };

  return (
    <div className="p-4 bg-[#1a1a1a] border border-stone-800 rounded-lg shadow-xl w-full">
      <h3 className="text-lg font-bold mb-4 text-[#b06a3b]">{t('genreGenerator') || 'Genre Progression Generator'}</h3>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-grow flex items-center gap-2">
            <Label className="text-gray-300">{t('genre') || 'Genre'}:</Label>
            <Select value={selectedGenre} onValueChange={(v) => setSelectedGenre(v as keyof typeof GENRES)}>
              <SelectTrigger className="w-full md:w-[220px] bg-[#2a2a2a] border-stone-700 text-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-stone-800 text-gray-300">
                {Object.keys(GENRES).map(g => (
                  <SelectItem key={g} value={g} className="hover:bg-stone-800 focus:bg-stone-800">{t(g as never)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generateProgression} className="w-full md:w-auto bg-[#b06a3b] hover:bg-[#8e5630] text-white">{t('generate')}</Button>
        </div>

        <div className="bg-black/30 p-3 rounded border border-stone-800 text-center">
          <span className="text-[10px] uppercase text-stone-500 font-bold block mb-1">Scale Formula</span>
          <code className="text-[#b06a3b] text-xs font-mono">{GENRES[selectedGenre].formula}</code>
        </div>

        {currentProgression.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {currentProgression.map((roman, i) => {
              const isMajor = selectedGenre === 'Pop / Ballad' || selectedGenre === 'Blues / Funk';
              const chord = romanToChord(roman, selectedRoot, isMajor);
              return (
                <Button
                  key={i}
                  variant="outline"
                  className="flex flex-col h-auto py-3 px-5 bg-[#2a2a2a] border-stone-700 hover:bg-stone-800 text-gray-300 group transition-all"
                  onClick={() => onChordSelect(chord.root, chord.type)}
                >
                  <span className="text-[10px] text-stone-500 font-mono group-hover:text-[#b06a3b] transition-colors">{roman}</span>
                  <span className="font-bold text-sm">{chord.root} {chord.type}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressionGenerator;
