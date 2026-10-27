import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PremiumDialog from '@/components/ui/PremiumDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const TAKEAWAYS = ['thought', 'breathing', 'action', 'kindness', 'share', 'break', 'win'];
const INSIGHTS = ['breathing', 'grounding', 'cognitive_restructuring', 'behavioral_activation', 'mindfulness'];

export default function DailyReflection({ todayFlow, exercise, onClose }) {
  const { t } = useTranslation();
  const [selectedTakeaway, setSelectedTakeaway] = useState('');
  const [customTakeaway, setCustomTakeaway] = useState('');
  const closeTimer = useRef();
  const queryClient = useQueryClient();
  const insight = t(`home_practice.insights.${!exercise ? 'no_exercise' : INSIGHTS.includes(exercise.category) ? exercise.category : 'general'}`);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const completeMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.DailyFlow.update(todayFlow.id, {
        reflection_completed: true,
        reflection_time: new Date().toISOString(),
        key_insight: insight,
        daily_takeaway: customTakeaway.trim() || t(`home_practice.takeaways.${selectedTakeaway}`)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayFlow'] });
      closeTimer.current = setTimeout(onClose, 2000);
    }
  });
  const canSubmit = Boolean(customTakeaway.trim() || selectedTakeaway);

  return (
    <PremiumDialog label={t('home_practice.reflection_title')} onClose={onClose}
      className="fixed inset-0 overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center py-4 sm:items-center sm:py-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
          <Card className="rounded-[var(--radius-card)] border border-border bg-card shadow-2xl">
            <CardContent className="p-4 sm:p-8">
              {completeMutation.isSuccess ? (
                <div className="py-6 text-center" role="status">
                  <CheckCircle2 className="mx-auto mb-6 h-12 w-12 text-primary" />
                  <h2 className="mb-3 text-2xl font-semibold text-foreground">{t('home_practice.success_title')}</h2>
                  <p className="text-muted-foreground">{t('home_practice.success_body')}</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Lightbulb className="h-6 w-6 shrink-0 text-primary" />
                      <h2 className="text-2xl font-semibold text-foreground">{t('home_practice.reflection_title')}</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('common.close')} className="shrink-0"><X className="h-5 w-5" /></Button>
                  </div>
                  <div className="mb-6 rounded-2xl border border-border bg-secondary/60 p-4 sm:p-6">
                    <h3 className="mb-3 flex items-center gap-3 font-semibold text-foreground"><Sparkles className="h-5 w-5 shrink-0 text-primary" />{t('home_practice.insight_title')}</h3>
                    <p className="leading-relaxed text-foreground">{insight}</p>
                  </div>
                  <fieldset disabled={completeMutation.isPending} className="mb-6 min-w-0">
                    <legend className="mb-4 font-semibold text-foreground">{t('home_practice.choose')}</legend>
                    <div className="mb-4 space-y-2">
                      {TAKEAWAYS.map((key) => (
                        <button key={key} type="button" aria-pressed={selectedTakeaway === key}
                          onClick={() => { setSelectedTakeaway(key); setCustomTakeaway(''); }}
                          className={`flex w-full items-center gap-3 rounded-xl border p-4 text-start text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedTakeaway === key ? 'border-primary bg-secondary ring-1 ring-primary' : 'border-border bg-muted hover:bg-secondary'}`}>
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-primary text-primary" aria-hidden="true">{selectedTakeaway === key && <CheckCircle2 className="h-4 w-4" />}</span>
                          <span>{t(`home_practice.takeaways.${key}`)}</span>
                        </button>
                      ))}
                    </div>
                    <label htmlFor="daily-reflection-takeaway" className="mb-2 block text-sm font-medium text-foreground">{t('home_practice.custom')}</label>
                    <Textarea id="daily-reflection-takeaway" value={customTakeaway} rows={3}
                      onChange={(event) => { setCustomTakeaway(event.target.value); setSelectedTakeaway(''); }}
                      placeholder={t('home_practice.placeholder')} />
                  </fieldset>
                  {completeMutation.isError && <p role="alert" className="mb-4 rounded-xl border border-border bg-secondary p-3 text-foreground">{t('home_practice.save_error')}</p>}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={onClose} className="h-auto flex-1 whitespace-normal">{t('common.cancel')}</Button>
                    <Button onClick={() => completeMutation.mutate()} disabled={!canSubmit || completeMutation.isPending} className="h-auto flex-1 whitespace-normal" aria-busy={completeMutation.isPending}>
                      {t(completeMutation.isPending ? 'home_practice.saving' : 'home_practice.complete')}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PremiumDialog>
  );
}
