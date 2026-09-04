import React from 'react';
import { Check, ChevronRight, Circle, HeartPulse, MessageCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function DailyPath({ checkInComplete, exerciseComplete, hasRecommendedExercise, onCheckIn, onCoach, onExercise }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const Arrow = isRtl ? ({ className }) => <ChevronRight className={cn(className, 'rotate-180')} /> : ChevronRight;

  const steps = [
    {
      key: 'checkin',
      Icon: HeartPulse,
      complete: checkInComplete,
      onClick: onCheckIn,
    },
    {
      key: 'coach',
      Icon: MessageCircle,
      complete: false,
      onClick: onCoach,
    },
    {
      key: 'action',
      Icon: Sparkles,
      complete: exerciseComplete,
      onClick: onExercise,
      disabled: !hasRecommendedExercise && exerciseComplete,
    },
  ];

  return (
    <Card className="overflow-hidden rounded-[34px] border border-white/80 bg-white/88 shadow-[0_24px_64px_rgba(36,105,92,0.16)] backdrop-blur-xl" data-testid="daily-path">
      <div className="h-1.5 bg-gradient-to-r from-amber-300 via-teal-400 to-emerald-500" />
      <div className="p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{t('daily_path.eyebrow')}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('daily_path.title')}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{t('daily_path.description')}</p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {steps.map(({ key, Icon, complete, onClick, disabled }) => (
            <button
              type="button"
              key={key}
              onClick={onClick}
              disabled={disabled}
              className="group flex min-h-[132px] flex-col rounded-[24px] border border-teal-100 bg-gradient-to-br from-white to-teal-50/70 p-4 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-60"
            >
              <div className="flex w-full items-center justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700"><Icon className="h-5 w-5" /></span>
                {complete ? <Check className="h-5 w-5 text-emerald-600" /> : <Circle className="h-4 w-4 text-teal-300" />}
              </div>
              <span className="mt-3 text-sm font-bold text-slate-900">{t(`daily_path.${key}.title`)}</span>
              <span className="mt-1 flex-1 text-xs leading-5 text-slate-500">{t(`daily_path.${key}.description`)}</span>
              <span className="mt-3 inline-flex items-center text-xs font-bold text-teal-700">
                {t('daily_path.open')}
                <Arrow className="ms-1 h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
