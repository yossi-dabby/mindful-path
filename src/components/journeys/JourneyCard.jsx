import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Footprints,
  Gauge,
  Loader2,
  PauseCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getJourneyProgressPercentage } from './journeyUtils';

export default function JourneyCard({
  journey,
  progress,
  onStart,
  onContinue,
  onView,
  isStarting = false,
}) {
  const { t } = useTranslation();
  const isStarted = Boolean(progress);
  const isCompleted = progress?.status === 'completed';
  const isPaused = progress?.status === 'paused';
  const stepCount = Array.isArray(journey.steps) ? journey.steps.length : 0;
  const completionPercentage = getJourneyProgressPercentage(progress, stepCount);
  const categoryLabel = t('journeys.categories.' + journey.category, {
    defaultValue: t('journeys.categories.other'),
  });
  const difficultyLabel = t('journeys.difficulties.' + journey.difficulty, {
    defaultValue: t('journeys.difficulties.beginner'),
  });

  return (
    <Card
      className="group relative h-full overflow-hidden rounded-[26px] border border-white/80 bg-white/72 shadow-[0_20px_48px_rgba(42,103,91,0.12)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_62px_rgba(42,103,91,0.18)]"
      data-testid={'journey-card-' + journey.id}
    >
      <div className="pointer-events-none absolute -end-16 -top-16 h-36 w-36 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -start-16 h-36 w-36 rounded-full bg-teal-200/35 blur-3xl" />

      <CardContent className="relative flex h-full min-w-0 flex-col p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <span className="inline-flex min-h-8 items-center rounded-full border border-violet-700/10 bg-violet-50/90 px-3 py-1 text-xs font-bold text-violet-800">
            {categoryLabel}
          </span>
          {isCompleted && (
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-emerald-700/10 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {t('journeys.tabs.completed')}
            </span>
          )}
          {isPaused && (
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-amber-700/10 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
              <PauseCircle className="h-4 w-4" aria-hidden="true" />
              {t('journeys.card.paused')}
            </span>
          )}
        </div>

        <h2 className="break-words text-xl font-bold leading-tight tracking-tight text-teal-950">
          {journey.title}
        </h2>
        <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-slate-600">
          {journey.description}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2" aria-label={t('journeys.card.details_aria')}>
          <div className="min-w-0 rounded-2xl border border-teal-800/8 bg-white/75 px-2 py-3 text-center">
            <CalendarDays className="mx-auto h-4 w-4 text-teal-700" aria-hidden="true" />
            <strong className="mt-1 block truncate text-sm text-teal-950">{journey.duration_days || 0}</strong>
            <span className="block truncate text-[10px] font-medium text-slate-500">{t('journeys.card.days')}</span>
          </div>
          <div className="min-w-0 rounded-2xl border border-teal-800/8 bg-white/75 px-2 py-3 text-center">
            <Footprints className="mx-auto h-4 w-4 text-teal-700" aria-hidden="true" />
            <strong className="mt-1 block truncate text-sm text-teal-950">{stepCount}</strong>
            <span className="block truncate text-[10px] font-medium text-slate-500">{t('journeys.card.steps')}</span>
          </div>
          <div className="min-w-0 rounded-2xl border border-teal-800/8 bg-white/75 px-2 py-3 text-center">
            <Gauge className="mx-auto h-4 w-4 text-teal-700" aria-hidden="true" />
            <strong className="mt-1 block truncate text-xs text-teal-950">{difficultyLabel}</strong>
            <span className="block truncate text-[10px] font-medium text-slate-500">{t('journeys.card.level')}</span>
          </div>
        </div>

        {isStarted && (
          <div className="mt-5 rounded-2xl border border-teal-800/10 bg-emerald-50/70 p-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-teal-900">
              <span>{t('journeys.card.progress')}</span>
              <span dir="ltr">{completionPercentage}%</span>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-teal-900/10"
              role="progressbar"
              aria-label={t('journeys.card.progress')}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={completionPercentage}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-[width] duration-500"
                style={{ width: completionPercentage + '%' }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
          {!isStarted && (
            <Button
              type="button"
              onClick={() => onStart(journey)}
              disabled={isStarting || stepCount === 0}
              className="min-h-12 flex-1 rounded-2xl bg-teal-700 px-4 text-white shadow-md hover:bg-teal-800"
              data-testid={'journey-start-' + journey.id}
            >
              {isStarting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Footprints className="h-4 w-4" aria-hidden="true" />}
              {isStarting ? t('journeys.premium.starting') : t('journeys.card.start_journey')}
            </Button>
          )}

          {isStarted && !isCompleted && (
            <Button
              type="button"
              onClick={() => onContinue(journey, progress)}
              className="min-h-12 flex-1 rounded-2xl bg-teal-700 px-4 text-white shadow-md hover:bg-teal-800"
              data-testid={'journey-continue-' + journey.id}
            >
              {t('journeys.card.continue_journey')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Button>
          )}

          <Button
            type="button"
            onClick={() => onView(journey, progress)}
            variant="outline"
            className="min-h-12 flex-1 rounded-2xl border-teal-800/15 bg-white/85 px-4 text-teal-900 hover:bg-white"
            data-testid={'journey-view-' + journey.id}
          >
            {t('journeys.card.view_details')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
