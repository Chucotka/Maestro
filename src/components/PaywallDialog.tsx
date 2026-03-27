import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSubscription, PLANS, PlanTier } from '@/lib/subscription';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Check, Crown, X, Star, Zap } from 'lucide-react';

const PaywallDialog: React.FC = () => {
  const { showPaywall, setShowPaywall, setPlan, plan } = useSubscription();
  const { language } = useI18n();
  const isRu = language === 'ru';
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');

  if (!showPaywall) return null;

  const handleSelect = (tier: PlanTier) => {
    if (tier === 'free') {
      setPlan('free');
      setShowPaywall(false);
      return;
    }
    // In production: redirect to Stripe / RevenueCat / App Store IAP
    setPlan(tier);
    setShowPaywall(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-[#1a1a1a] border border-stone-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-2">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-[#b06a3b]" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {isRu ? 'Разблокируйте все возможности' : 'Unlock All Features'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowPaywall(false)} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="px-4 sm:px-6 text-sm text-gray-400 mb-4">
          {isRu
            ? 'Выберите план, который подходит вашим целям обучения'
            : 'Choose the plan that fits your learning goals'}
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-1.5 mb-5 px-4 flex-wrap">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all",
              billingCycle === 'monthly'
                ? "bg-[#b06a3b] text-white"
                : "bg-stone-800 text-gray-400 hover:text-white"
            )}
          >
            {isRu ? 'Месяц' : 'Monthly'}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1",
              billingCycle === 'yearly'
                ? "bg-[#b06a3b] text-white"
                : "bg-stone-800 text-gray-400 hover:text-white"
            )}
          >
            {isRu ? 'Год' : 'Yearly'}
            <span className="text-[9px] sm:text-[10px] bg-green-600 text-white px-1 sm:px-1.5 py-0.5 rounded-full font-bold">
              -37%
            </span>
          </button>
          <button
            onClick={() => setBillingCycle('lifetime')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1",
              billingCycle === 'lifetime'
                ? "bg-[#b06a3b] text-white"
                : "bg-stone-800 text-gray-400 hover:text-white"
            )}
          >
            {isRu ? 'Навсегда' : 'Lifetime'}
            <span className="text-[9px] sm:text-[10px] bg-purple-600 text-white px-1 sm:px-1.5 py-0.5 rounded-full font-bold">
              {isRu ? 'ТОП' : 'BEST'}
            </span>
          </button>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 px-4 sm:px-6 pb-5">
          {PLANS.map((p) => {
            const price = billingCycle === 'lifetime'
              ? (isRu ? (p.priceLifetimeRu || p.priceMonthlyRu) : (p.priceLifetime || p.priceMonthly))
              : billingCycle === 'yearly'
                ? (isRu ? p.priceYearlyPerMonthRu : p.priceYearlyPerMonth)
                : (isRu ? p.priceMonthlyRu : p.priceMonthly);
            const totalYearly = isRu ? p.priceYearlyRu : p.priceYearly;
            const savingsText = billingCycle === 'yearly' && p.savings
              ? (isRu ? p.savingsRu : p.savings)
              : null;

            return (
              <div
                key={p.id}
                className={cn(
                  "relative flex flex-col rounded-xl border p-4 sm:p-5 transition-all",
                  p.popular
                    ? "border-[#b06a3b] bg-[#b06a3b]/10 shadow-lg shadow-[#b06a3b]/20"
                    : "border-stone-700 bg-[#222]",
                  plan === p.id && "ring-2 ring-[#b06a3b]"
                )}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#b06a3b] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                    <Star className="h-3 w-3" /> {isRu ? 'ЛУЧШЕЕ ПРЕДЛОЖЕНИЕ' : 'BEST VALUE'}
                  </div>
                )}

                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  {isRu ? p.nameRu : p.name}
                  {p.id === 'premium' && <Zap className="h-4 w-4 text-yellow-400" />}
                </h3>

                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#b06a3b]">{price}</span>
                    {p.id !== 'free' && billingCycle !== 'lifetime' && (
                      <span className="text-xs text-gray-500">
                        /{isRu ? 'мес' : 'mo'}
                      </span>
                    )}
                  </div>
                  {p.id !== 'free' && billingCycle === 'yearly' && (
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {totalYearly}/{isRu ? 'год' : 'year'}
                      {savingsText && (
                        <span className="ml-1.5 text-green-400 font-semibold">{savingsText}</span>
                      )}
                    </div>
                  )}
                  {p.id !== 'free' && billingCycle === 'lifetime' && (
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {isRu ? 'единоразово' : 'one-time payment'}
                    </div>
                  )}
                  {p.id === 'free' && (
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {isRu ? 'навсегда' : 'forever'}
                    </div>
                  )}
                </div>

                <ul className="flex-1 space-y-1.5 mb-4">
                  {(isRu ? p.featuresRu : p.features).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-gray-300">
                      <Check className="h-3.5 w-3.5 text-[#b06a3b] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelect(p.id)}
                  className={cn(
                    "w-full font-bold text-sm",
                    p.popular
                      ? "bg-[#b06a3b] hover:bg-[#8e5630] text-white"
                      : plan === p.id
                        ? "bg-stone-700 text-white"
                        : "bg-stone-800 hover:bg-stone-700 text-gray-300"
                  )}
                >
                  {plan === p.id
                    ? (isRu ? 'Текущий план' : 'Current Plan')
                    : p.id === 'free'
                      ? (isRu ? 'Продолжить бесплатно' : 'Continue Free')
                      : billingCycle === 'lifetime'
                        ? (isRu ? 'Купить навсегда' : 'Buy Lifetime')
                        : (isRu ? 'Начать бесплатный период' : 'Start Free Trial')}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-center space-y-1">
          <p className="text-[11px] text-gray-500">
            {isRu
              ? '7 дней бесплатно для новых пользователей. Отмена в любое время.'
              : '7-day free trial for new users. Cancel anytime.'}
          </p>
          <p className="text-[10px] text-gray-600">
            {isRu
              ? 'Оплата через Apple Pay, Google Pay или банковскую карту через Stripe.'
              : 'Pay via Apple Pay, Google Pay, or credit card via Stripe.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaywallDialog;
