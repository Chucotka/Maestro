import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type PlanTier = 'free' | 'pro' | 'premium';

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  nameRu: string;
  priceMonthly: string;
  priceMonthlyRu: string;
  priceYearly: string;
  priceYearlyRu: string;
  priceYearlyPerMonth: string;
  priceYearlyPerMonthRu: string;
  priceLifetime?: string;
  priceLifetimeRu?: string;
  features: string[];
  featuresRu: string[];
  popular?: boolean;
  savings?: string;
  savingsRu?: string;
}

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    nameRu: 'Бесплатный',
    priceMonthly: '$0',
    priceMonthlyRu: '0 ₽',
    priceYearly: '$0',
    priceYearlyRu: '0 ₽',
    priceYearlyPerMonth: '$0',
    priceYearlyPerMonthRu: '0 ₽',
    features: [
      'Basic scales & chords (5 scales)',
      'Interactive fretboard',
      'Metronome',
      'Acoustic guitar sound',
      'Standard tuning',
    ],
    featuresRu: [
      'Базовые гаммы и аккорды (5 гамм)',
      'Интерактивный гриф',
      'Метроном',
      'Звук акустической гитары',
      'Стандартный строй',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    nameRu: 'Про',
    priceMonthly: '$3.99',
    priceMonthlyRu: '349 ₽',
    priceYearly: '$29.99',
    priceYearlyRu: '2 490 ₽',
    priceYearlyPerMonth: '$2.49',
    priceYearlyPerMonthRu: '207 ₽',
    popular: true,
    priceLifetime: '$49.99',
    priceLifetimeRu: '3 990 ₽',
    savings: 'Save 37%',
    savingsRu: 'Экономия 37%',
    features: [
      'All 20+ scales & modes',
      'CAGED system',
      'Arpeggio player (11 patterns)',
      '6 instruments (incl. distortion)',
      'Circle of Fifths',
      'Progression generator',
      'Triads & chord voicings',
    ],
    featuresRu: [
      'Все 20+ гамм и ладов',
      'Система CAGED',
      'Арпеджиатор (11 паттернов)',
      '6 инструментов (вкл. дисторшн)',
      'Квинтовый круг',
      'Генератор прогрессий',
      'Триады и аппликатуры аккордов',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    nameRu: 'Премиум',
    priceMonthly: '$6.99',
    priceMonthlyRu: '599 ₽',
    priceYearly: '$49.99',
    priceYearlyRu: '3 990 ₽',
    priceYearlyPerMonth: '$4.16',
    priceYearlyPerMonthRu: '332 ₽',
    priceLifetime: '$79.99',
    priceLifetimeRu: '6 490 ₽',
    savings: 'Save 40%',
    savingsRu: 'Экономия 40%',
    features: [
      'Everything in Pro',
      'Audio input / Pitch detection',
      'All alternate tunings',
      'Note quiz mode',
      'Chord finder',
      'Offline mode (PWA)',
      'Priority support',
    ],
    featuresRu: [
      'Всё из Про',
      'Аудио-вход / Определение нот',
      'Все альтернативные строи',
      'Режим квиза по нотам',
      'Поиск аккордов',
      'Оффлайн-режим (PWA)',
      'Приоритетная поддержка',
    ],
  },
];

export const FREE_SCALES = ['MAJOR', 'MINOR', 'MINOR PENTATONIC', 'MAJOR PENTATONIC', 'BLUES'];

interface SubscriptionContextType {
  plan: PlanTier;
  setPlan: (plan: PlanTier) => void;
  isPro: boolean;
  isPremium: boolean;
  canUseFeature: (feature: string) => boolean;
  showPaywall: boolean;
  setShowPaywall: (v: boolean) => void;
  paywallFeature: string;
  requestFeature: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const PRO_FEATURES = ['caged', 'arpeggios', 'all_scales', 'all_instruments', 'circle', 'progressions'];
const PREMIUM_FEATURES = ['audio_input', 'all_tunings', 'quiz', 'finder', 'offline'];

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plan, setPlanState] = useState<PlanTier>(() => {
    try {
      return (localStorage.getItem('maestro_plan') as PlanTier) || 'free';
    } catch {
      return 'free';
    }
  });
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');

  const setPlan = useCallback((p: PlanTier) => {
    setPlanState(p);
    try { localStorage.setItem('maestro_plan', p); } catch {}
  }, []);

  const isPro = plan === 'pro' || plan === 'premium';
  const isPremium = plan === 'premium';

  const canUseFeature = useCallback((feature: string) => {
    if (plan === 'premium') return true;
    if (plan === 'pro') return !PREMIUM_FEATURES.includes(feature);
    return !PRO_FEATURES.includes(feature) && !PREMIUM_FEATURES.includes(feature);
  }, [plan]);

  const requestFeature = useCallback((feature: string) => {
    if (canUseFeature(feature)) return true;
    setPaywallFeature(feature);
    setShowPaywall(true);
    return false;
  }, [canUseFeature]);

  return (
    <SubscriptionContext.Provider value={{
      plan, setPlan, isPro, isPremium, canUseFeature,
      showPaywall, setShowPaywall, paywallFeature, requestFeature
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};
