import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Crown, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PremiumPaywall({ onClose }) {
  const { t } = useTranslation();

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('createCheckoutSession', {
        priceId: 'price_premium_monthly',
        successUrl: window.location.origin + '/?upgraded=true',
        cancelUrl: window.location.href
      });
      if (!data?.url) throw new Error('Missing checkout URL');
      window.location.href = data.url;
    }
  });

  const features = [
    t('settings.subscription.feature_sessions'),
    t('settings.subscription.feature_exercises'),
    t('settings.subscription.feature_mood')
  ];

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-md sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-dialog-title"
      data-testid="premium-paywall"
    >
      <Card className="relative my-auto w-full max-w-2xl overflow-hidden border border-white/80 bg-white/95 shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-amber-100 via-teal-50 to-emerald-100" aria-hidden="true" />
        <CardContent className="relative p-5 pt-7 sm:p-10">
          <button
            type="button"
            onClick={onClose}
            className="absolute end-4 top-4 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white bg-white/85 text-slate-600 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label={t('premium.close_aria')}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25 sm:h-20 sm:w-20">
              <Crown className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h2 id="premium-dialog-title" className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {t('premium.title')}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
              {t('premium.subtitle')}
            </p>
          </div>

          <div className="mb-6 rounded-3xl border border-amber-200/80 bg-white p-5 shadow-lg shadow-amber-900/5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('premium.plan')}</p>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">$9.99</span>
                  <span className="text-sm text-slate-500">{t('premium.month')}</span>
                </div>
              </div>
              <Badge className="border-0 bg-emerald-100 px-3 py-1 text-emerald-800">{t('premium.best_value')}</Badge>
            </div>
            <p className="mt-3 text-xs text-slate-500">{t('premium.cancel_anytime')}</p>
          </div>

          <div className="mb-7 grid gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-2 rounded-2xl bg-teal-50/70 p-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-sm leading-5 text-slate-700">{feature.replace(/^✓\s*/, '')}</span>
              </div>
            ))}
          </div>

          {checkoutMutation.isError && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {t('premium.checkout_error')}
            </div>
          )}

          <Button
            type="button"
            onClick={() => checkoutMutation.mutate()}
            disabled={checkoutMutation.isPending}
            className="min-h-[52px] w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-base font-bold text-white shadow-lg shadow-teal-600/20 hover:from-teal-700 hover:to-emerald-700"
          >
            <Sparkles className="me-2 h-5 w-5" />
            {checkoutMutation.isPending ? t('premium.loading') : t('premium.start_trial')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
