import React, { useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PremiumCoachShell({
  icon: Icon,
  title,
  step,
  stepLabel,
  onBack,
  onClose,
  backAriaLabel,
  closeAriaLabel,
  children,
  footer,
  testId
}) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape, true);
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex h-dvh w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),transparent_34%),linear-gradient(155deg,#e6f6f1_0%,#d4eee7_52%,#c3e5dc_100%)] text-slate-900"
      data-testid={testId}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="pointer-events-none absolute -start-24 top-20 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -end-24 bottom-20 h-72 w-72 rounded-full bg-violet-300/15 blur-3xl" />

      <header className="relative z-10 shrink-0 border-b border-white/70 bg-white/70 shadow-[0_10px_30px_rgba(42,103,91,0.08)] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)]">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold tracking-tight text-teal-950 sm:text-xl">{title}</h1>
              <p className="mt-0.5 text-xs font-semibold text-teal-700 sm:text-sm">{stepLabel}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={step > 1 ? onBack : onClose}
              className="h-12 w-12 shrink-0 rounded-2xl border border-teal-900/10 bg-white/80 text-teal-800 shadow-sm hover:bg-white focus-visible:ring-2 focus-visible:ring-teal-600"
              aria-label={step > 1 ? backAriaLabel : closeAriaLabel}
              data-testid="coach-header-action"
            >
              {step > 1 ? <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" /> : <X className="h-5 w-5" aria-hidden="true" />}
            </Button>
          </div>

          <div className="mt-3 flex items-center gap-2" aria-hidden="true">
            {[1, 2, 3, 4].map((item) => (
              <span
                key={item}
                className={`h-1.5 flex-1 rounded-full transition-colors ${item <= step ? 'bg-teal-600' : 'bg-teal-900/10'}`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="relative z-[1] min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-3xl px-4 py-5 pb-8 sm:px-6 sm:py-7">
          <section className="rounded-[28px] border border-white/75 bg-white/70 p-4 shadow-[0_24px_60px_rgba(42,103,91,0.13)] backdrop-blur-xl sm:p-7">
            {children}
          </section>
        </div>
      </main>

      <footer className="relative z-10 shrink-0 border-t border-white/75 bg-white/80 shadow-[0_-10px_30px_rgba(42,103,91,0.08)] backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6">{footer}</div>
      </footer>
    </div>
  );
}

export function PremiumStepHeading({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold leading-tight tracking-tight text-teal-950 sm:text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{subtitle}</p>
    </div>
  );
}

export const premiumInputClass = 'min-h-12 rounded-2xl border-teal-900/15 bg-white/90 text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/25';
