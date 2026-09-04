import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, ChevronRight, Flag, Route } from 'lucide-react';
import { createPageUrl } from '../utils';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function MyPath() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const Arrow = isRtl ? ({ className }) => <ChevronRight className={cn(className, 'rotate-180')} /> : ChevronRight;
  const items = [
    { label: t('my_path.goals'), path: 'Goals', Icon: Flag },
    { label: t('my_path.progress'), path: 'Progress', Icon: BarChart3 },
    { label: t('my_path.starter'), path: 'StarterPath', Icon: Route },
  ];

  return (
    <main className="page-container mx-auto min-h-[100dvh] max-w-5xl px-4 pb-28 pt-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_64px_rgba(36,105,92,0.14)] backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{t('daily_path.eyebrow')}</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{t('my_path.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('my_path.subtitle')}</p>
      </header>
      <section className="mt-5 grid gap-3 md:grid-cols-3">
        {items.map(({ label, path, Icon }) => (
          <Link key={path} to={createPageUrl(path)} className="group">
            <Card className="flex min-h-[150px] flex-col rounded-[26px] border-teal-100 bg-gradient-to-br from-white to-teal-50/60 p-5 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:border-teal-300 group-hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700"><Icon className="h-6 w-6" /></span>
              <span className="mt-4 flex items-center justify-between gap-3 font-bold text-slate-900">
                {label}<Arrow className="h-4 w-4 text-teal-700" />
              </span>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
