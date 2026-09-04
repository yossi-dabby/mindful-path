import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CloudRain,
  CloudSun,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import PremiumIcon from '@/components/ui/PremiumIcon';
import { AppWordmark, GrowingShieldMark } from '@/components/brand/AppBrand';

const focusDefinitions = [
  { value: 'stress', key: 'stress', icon: 'waves' },
  { value: 'anxiety', key: 'anxiety', icon: 'wind' },
  { value: 'sleep', key: 'sleep', icon: 'moon' },
  { value: 'mood', key: 'mood', icon: 'sun' },
  { value: 'focus', key: 'focus', icon: 'target' },
  { value: 'relationships', key: 'relationships', icon: 'heart' },
];

const moodDefinitions = [
  { value: 'very_low', key: 'very_low', Icon: CloudRain },
  { value: 'low', key: 'low', Icon: CloudRain },
  { value: 'okay', key: 'okay', Icon: CloudSun },
  { value: 'good', key: 'good', Icon: Sun },
  { value: 'great', key: 'great', Icon: Sparkles },
];

const supportDefinitions = [
  { value: 'listen', key: 'listen', Icon: HeartHandshake },
  { value: 'practical', key: 'practical', Icon: Check },
  { value: 'guided', key: 'guided', Icon: Sparkles },
];

export default function WelcomeWizard({ onComplete }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ focus_areas: [], onboarding_mood: '', support_style: '' });
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: () => base44.auth.updateMe({
      onboarding_completed: true,
      focus_areas: formData.focus_areas,
      onboarding_mood: formData.onboarding_mood,
      support_style: formData.support_style,
    }),
    onSuccess: () => {
      try {
        const previous = JSON.parse(sessionStorage.getItem('user_prefs_loaded') || '{}');
        sessionStorage.setItem('user_prefs_loaded', JSON.stringify({ ...previous, onboarding_completed: true }));
      } catch (_) {}
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      onComplete();
    },
  });

  const canContinue = useMemo(() => {
    if (step === 1) return formData.focus_areas.length > 0;
    if (step === 2) return Boolean(formData.onboarding_mood);
    if (step === 3) return Boolean(formData.support_style);
    return true;
  }, [formData, step]);

  const toggleFocusArea = (value) => {
    setFormData((previous) => ({
      ...previous,
      focus_areas: previous.focus_areas.includes(value)
        ? previous.focus_areas.filter((area) => area !== value)
        : [...previous.focus_areas, value],
    }));
  };

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;

  const optionClass = (selected) => cn(
    'group min-h-[76px] rounded-2xl border p-3 text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
    selected
      ? 'border-teal-500 bg-teal-50 text-teal-950 shadow-[0_10px_26px_rgba(15,118,110,0.13)]'
      : 'border-slate-200 bg-white/85 text-slate-700 hover:border-teal-200 hover:bg-white'
  );

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[linear-gradient(145deg,#dff5ef_0%,#fbf8f0_52%,#e4f3ef_100%)]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-2xl items-center px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
        <div className="w-full">
          <div className="mb-4 flex items-center justify-center gap-3">
            <GrowingShieldMark size={46} />
            <AppWordmark name={t('global.app_name')} />
          </div>

          <Card className="overflow-hidden rounded-[32px] border border-white/80 bg-white/88 shadow-[0_30px_90px_rgba(36,105,92,0.18)] backdrop-blur-xl">
            <div className="h-1.5 bg-gradient-to-r from-amber-300 via-teal-400 to-emerald-500" />
            <CardContent className="p-5 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{t('onboarding.step_label', { step })}</p>
                  <div className="mt-2 flex gap-1.5" dir="ltr">
                    {[1, 2, 3, 4].map((item) => (
                      <span key={item} className={cn('h-1.5 rounded-full transition-all', item === step ? 'w-10 bg-teal-600' : item < step ? 'w-6 bg-teal-300' : 'w-6 bg-slate-200')} />
                    ))}
                  </div>
                </div>
                <ShieldCheck className="h-6 w-6 text-teal-700" aria-hidden="true" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  {step === 1 && (
                    <StepHeader title={t('onboarding.focus.title')} subtitle={t('onboarding.focus.subtitle')}>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {focusDefinitions.map((area) => {
                          const selected = formData.focus_areas.includes(area.value);
                          return (
                            <button type="button" key={area.value} onClick={() => toggleFocusArea(area.value)} className={optionClass(selected)} aria-pressed={selected}>
                              <PremiumIcon name={area.icon} size="sm" className="mb-2" />
                              <span className="block text-sm font-semibold">{t(`onboarding.focus.${area.key}`)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </StepHeader>
                  )}

                  {step === 2 && (
                    <StepHeader title={t('onboarding.mood.title')} subtitle={t('onboarding.mood.subtitle')}>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                        {moodDefinitions.map(({ value, key, Icon }) => {
                          const selected = formData.onboarding_mood === value;
                          return (
                            <button type="button" key={value} onClick={() => setFormData((previous) => ({ ...previous, onboarding_mood: value }))} className={optionClass(selected)} aria-pressed={selected}>
                              <Icon className="mb-2 h-6 w-6 text-teal-700" />
                              <span className="block text-sm font-semibold">{t(`onboarding.mood.${key}`)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </StepHeader>
                  )}

                  {step === 3 && (
                    <StepHeader title={t('onboarding.support.title')}>
                      <div className="space-y-2.5">
                        {supportDefinitions.map(({ value, key, Icon }) => {
                          const selected = formData.support_style === value;
                          return (
                            <button type="button" key={value} onClick={() => setFormData((previous) => ({ ...previous, support_style: value }))} className={cn(optionClass(selected), 'flex w-full items-center gap-3')} aria-pressed={selected}>
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700"><Icon className="h-5 w-5" /></span>
                              <span className="font-semibold">{t(`onboarding.support.${key}`)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </StepHeader>
                  )}

                  {step === 4 && (
                    <StepHeader title={t('onboarding.first.title')} subtitle={t('onboarding.first.description')}>
                      <div className="rounded-[26px] border border-teal-200/70 bg-gradient-to-br from-teal-50 to-amber-50 p-5 text-center">
                        <GrowingShieldMark size={64} className="mx-auto" />
                        <p className="mt-4 text-sm font-semibold text-teal-900">{t('daily_path.title')}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{t('daily_path.description')}</p>
                      </div>
                    </StepHeader>
                  )}
                </motion.div>
              </AnimatePresence>

              {completeMutation.isError && <p role="alert" className="mt-4 text-center text-sm font-medium text-red-600">{t('onboarding.error')}</p>}

              <div className="mt-6 flex gap-3">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep((value) => value - 1)} className="min-h-12 flex-1 rounded-2xl">
                    <BackIcon className="me-2 h-4 w-4" />
                    {t('onboarding.back')}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => step < 4 ? setStep((value) => value + 1) : completeMutation.mutate()}
                  disabled={!canContinue || completeMutation.isPending}
                  className="min-h-12 flex-1 rounded-2xl bg-teal-700 font-semibold text-white shadow-lg shadow-teal-700/20 hover:bg-teal-800"
                >
                  {step === 4
                    ? (completeMutation.isPending ? t('onboarding.completing') : t('onboarding.first.cta'))
                    : t('onboarding.continue')}
                  {step < 4 && <NextIcon className="ms-2 h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StepHeader({ title, subtitle, children }) {
  return (
    <section>
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
