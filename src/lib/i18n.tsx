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
    degrees: 'Degrees',
    allNotes: 'All Notes',
    virtual: 'Virtual',
    triads: 'Triads',
    myFav: 'My Fav',
    recScales: 'Rec. Scales',
    play: 'Play',
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
    find_note_quiz: 'Note Discovery Quiz',
    find_note: 'Find this note',
    start_quiz: 'Start Quiz',
    start_quiz_desc: 'Press start to begin note finding game',
    next_note: 'Next Note',
    enter_notes: 'Enter notes separated by spaces (e.g., C E G)',
    notes_explanation: 'Understanding intervals and their positions on the fretboard is key to mastering the instrument. Toggle between Notes and Degrees to see the relationship.',
    matching_results: 'Matching Scales/Chords:',
    no_matches: 'No exact matches found.',
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
    degrees: 'Ступени',
    allNotes: 'Все ноты',
    virtual: 'Виртуально',
    triads: 'Триады',
    myFav: 'Избранное',
    recScales: 'Рек. Гаммы',
    play: 'Играть',
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
    find_note_quiz: 'Квиз: Найдите ноту на грифе',
    find_note: 'Найдите ноту',
    start_quiz: 'Начать квиз',
    start_quiz_desc: 'Нажмите старт, чтобы начать игру',
    next_note: 'Следующая нота',
    enter_notes: 'Введите ноты через пробел (например: C E G)',
    notes_explanation: 'Понимание интервалов и их расположения на грифе — ключ к мастерству. Переключайтесь между Названиями и Ступенями, чтобы видеть связи.',
    matching_results: 'Подходящие гаммы/аккорды:',
    no_matches: 'Точных совпадений не найдено.',
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
