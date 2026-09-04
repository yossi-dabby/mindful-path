import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarClock, CheckCircle2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createPageUrl } from '../../utils';

export default function SessionSummary({ conversation }) {
  const { t } = useTranslation();
  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: [],
  });

  if (!conversation?.session_summary) return null;

  const recommendedExercise = exercises.find((exercise) =>
    conversation.suggested_exercises?.includes(exercise.id)
  );

  return (
    <div className="overflow-x-hidden border-t border-teal-100 bg-teal-50/80 p-4 md:p-6">
      <Card className="mx-auto max-w-3xl rounded-[28px] border border-white/80 bg-white/92 shadow-[0_18px_50px_rgba(36,105,92,0.13)]">
        <CardContent className="space-y-3 p-5 sm:p-6">
          <SummarySection icon={CheckCircle2} title={t('chat_stage.summary.understood')}>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{conversation.session_summary}</p>
          </SummarySection>

          <SummarySection icon={Sparkles} title={t('chat_stage.summary.practice')}>
            {recommendedExercise ? (
              <div className="flex flex-col gap-3 rounded-2xl bg-teal-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{recommendedExercise.title}</p>
                  {recommendedExercise.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{recommendedExercise.description}</p>}
                </div>
                <Link to={createPageUrl('Exercises')} className="shrink-0">
                  <Button className="min-h-11 w-full rounded-xl bg-teal-700 font-semibold text-white hover:bg-teal-800 sm:w-auto">
                    {t('chat_stage.summary.open_practice')}
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-700">{t('daily_path.action.description')}</p>
            )}
          </SummarySection>

          <SummarySection icon={CalendarClock} title={t('chat_stage.summary.return')}>
            <p className="text-sm leading-6 text-slate-700">{t('chat_stage.summary.return_body')}</p>
          </SummarySection>
        </CardContent>
      </Card>
    </div>
  );
}

function SummarySection({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-teal-900">
        <Icon className="h-4 w-4 text-teal-700" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}
