import React, { useState } from 'react';
import { EMOTIONS, romanToChord, CHORDS } from '@/lib/fretboardUtils';
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
  const [selectedEmotion, setSelectedEmotion] = useState<keyof typeof EMOTIONS>("Happy / Joyful");
  const [currentProgression, setCurrentProgression] = useState<string[]>([]);

  const generateProgression = () => {
    const emotionData = EMOTIONS[selectedEmotion];
    const randomProg = emotionData.progressions[Math.floor(Math.random() * emotionData.progressions.length)];
    setCurrentProgression(randomProg);
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-xl backdrop-blur-sm w-full">
      <h3 className="text-lg font-bold mb-4 dark:text-gray-100">{t('emotionGenerator')}</h3>

      <div className="flex flex-col gap-4 items-center">
        <div className="flex items-center gap-2">
          <Label>{t('emotion')}:</Label>
          <Select value={selectedEmotion} onValueChange={(v) => setSelectedEmotion(v as keyof typeof EMOTIONS)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(EMOTIONS).map(e => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={generateProgression} size="sm">{t('generate')}</Button>
        </div>

        {currentProgression.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {currentProgression.map((roman, i) => {
              const chord = romanToChord(roman, selectedRoot, !selectedEmotion.includes("Sad") && !selectedEmotion.includes("Dark") && !selectedEmotion.includes("Epic"));
              return (
                <Button
                  key={i}
                  variant="outline"
                  className="flex flex-col h-auto py-2 px-4"
                  onClick={() => onChordSelect(chord.root, chord.type)}
                >
                  <span className="text-xs text-slate-500">{roman}</span>
                  <span className="font-bold">{chord.root} {chord.type}</span>
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
