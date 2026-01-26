import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ru';

const translations = {
  en: {
    title: 'Fret & Key Maestro',
    rootNote: 'Root Note',
    scaleMode: 'Scale/Mode',
    chordType: 'Chord Type',
    cagedShape: 'CAGED Shape',
    instrument: 'Instrument',
    acoustic: 'Acoustic',
    clean: 'Clean',
    distortion: 'Distortion',
    bass: 'Bass',
    piano: 'Piano',
    dark: 'Dark',
    scales: 'Scales',
    chords: 'Chords',
    caged: 'CAGED',
    tuning: 'Tuning',
    tunings: 'Tunings',
    showAllNotes: 'Show All Notes',
    showNoteNames: 'Show Note Names',
    currentNotes: 'Current Notes',
    metronome: 'Metronome',
    bpm: 'BPM',
    emotion: 'Emotion',
    generate: 'Generate',
    quiz: 'Quiz',
    finder: 'Finder',
    arpeggios: 'Arpeggios',
    notes: 'Notes',
    virtual: 'Virtual',
    triads: 'Triads',
    myFav: 'My Fav',
    recScales: 'Rec. Scales',
    playStatus: 'Play {{current}}/{{total}}',
    audioDisabled: 'Audio Disabled',
    enableAudio: 'Enable Realistic Audio',
    loadingInstruments: 'Loading High-Quality Sounds...',
    loadingMessage: 'Please wait while we load realistic instrument samples.',
    loading: 'Loading...',
    madeWith: 'Made with',
    arpeggio: 'Arpeggio Player',
    tempo: 'Tempo',
    up: 'Up',
    down: 'Down',
    circleOfFifths: 'Circle of Fifths',
    emotionGenerator: 'Emotion Progression Generator',
    cagedShapeNotes: 'CAGED {{shape}} Shape Notes:',
    scaleNotes: 'Current Scale Notes:',
    chordNotes: 'Current Chord Notes:',
    MAJOR: 'Major',
    MINOR: 'Minor',
    DORIAN: 'Dorian',
    PHRYGIAN: 'Phrygian',
    LYDIAN: 'Lydian',
    MIXOLYDIAN: 'Mixolydian',
    LOCRIAN: 'Locrian',
    PENTATONIC_MAJOR: 'Major Pentatonic',
    PENTATONIC_MINOR: 'Minor Pentatonic',
    BLUES: 'Blues',
    CHROMATIC: 'Chromatic',
    Major: 'Major',
    Minor: 'Minor',
    '7th': '7th',
    maj7: 'Major 7th',
    min7: 'Minor 7th',
    dim: 'Diminished',
    aug: 'Augmented',
  },
  ru: {
    title: 'Мастер Ладов и Клавиш',
    rootNote: 'Тоника',
    scaleMode: 'Гамма/Лад',
    chordType: 'Тип аккорда',
    cagedShape: 'Форма CAGED',
    instrument: 'Инструмент',
    acoustic: 'Акустика',
    clean: 'Чистый',
    distortion: 'Дисторшн',
    bass: 'Бас',
    piano: 'Пианино',
    dark: 'Темная',
    scales: 'Гаммы',
    chords: 'Аккорды',
    caged: 'CAGED',
    tuning: 'Строй',
    tunings: 'Строи',
    showAllNotes: 'Все ноты',
    showNoteNames: 'Названия нот',
    currentNotes: 'Текущие ноты',
    metronome: 'Метроном',
    bpm: 'УВМ',
    emotion: 'Эмоция',
    generate: 'Создать',
    quiz: 'Квиз',
    finder: 'Поиск',
    arpeggios: 'Арпеджио',
    notes: 'Ноты',
    virtual: 'Виртуально',
    triads: 'Триады',
    myFav: 'Избранное',
    recScales: 'Рек. Гаммы',
    playStatus: 'Играть {{current}}/{{total}}',
    audioDisabled: 'Звук выключен',
    enableAudio: 'Включить реалистичный звук',
    loadingInstruments: 'Загрузка качественных звуков...',
    loadingMessage: 'Пожалуйста, подождите, пока загружаются сэмплы инструментов.',
    loading: 'Загрузка...',
    madeWith: 'Сделано в',
    arpeggio: 'Арпеджиатор',
    tempo: 'Темп',
    up: 'Вверх',
    down: 'Вниз',
    circleOfFifths: 'Кварто-квинтовый круг',
    emotionGenerator: 'Генератор прогрессий по эмоциям',
    cagedShapeNotes: 'Ноты формы {{shape}} (CAGED):',
    scaleNotes: 'Ноты гаммы:',
    chordNotes: 'Ноты аккорда:',
    MAJOR: 'Мажор',
    MINOR: 'Минор',
    DORIAN: 'Дорийский',
    PHRYGIAN: 'Фригийский',
    LYDIAN: 'Лидийский',
    MIXOLYDIAN: 'Миксолидийский',
    LOCRIAN: 'Локрийский',
    PENTATONIC_MAJOR: 'Мажорная пентатоника',
    PENTATONIC_MINOR: 'Минорная пентатоника',
    BLUES: 'Блюз',
    CHROMATIC: 'Хроматическая',
    Major: 'Мажор',
    Minor: 'Минор',
    '7th': 'Доминантсептаккорд (7)',
    maj7: 'Большой мажорный септаккорд (maj7)',
    min7: 'Малый минорный септаккорд (min7)',
    dim: 'Уменьшенный',
    aug: 'Увеличенный',
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'], replace?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru'); // Default to RU as requested by user

  const t = (key: keyof typeof translations['en'], replace?: Record<string, string>) => {
    let text = translations[language][key] || translations['en'][key] || key;
    if (replace) {
      Object.entries(replace).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, v);
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
