import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock3, Crown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCurrentAppLocale } from '../i18n/appLocale.js';
import { getSubscriptionReadinessCopy } from './subscriptionReadiness.js';

export default function PremiumPaywall({ onClose }) {
  const { i18n } = useTranslation();
  const copy = getSubscriptionReadinessCopy(getCurrentAppLocale(i18n));

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-md sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-dialog-title"
      data-testid="premium-paywall"
    >
      <Card className="relative my-auto w-full max-w-xl overflow-hidden border border-white/80 bg-white/95 shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-amber-100 via-teal-50 to-emerald-100" aria-hidden="true" />
        <CardContent className="relative p-6 pt-8 sm:p-10">
          <button
            type="button"
            onClick={onClose}
            className="absolute end-4 top-4 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white bg-white/85 text-slate-600 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label={copy.close}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25">
              <Crown className="h-10 w-10" />
            </div>
            <h2 id="premium-dialog-title" className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {copy.modalTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
              {copy.modalBody}
            </p>
            <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900" role="status">
              <Clock3 className="h-4 w-4 shrink-0" />
              {copy.pending}
            </div>
            <Button type="button" onClick={onClose} className="mt-7 min-h-[48px] w-full rounded-2xl bg-teal-600 text-white hover:bg-teal-700">
              {copy.close}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
