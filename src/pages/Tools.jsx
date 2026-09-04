import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpenCheck, ChevronRight, Dumbbell, Gamepad2, Library, PlaySquare, Route } from 'lucide-react';
import { createPageUrl } from '../utils';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function Tools() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const Arrow = isRtl ? ({ className }) => <ChevronRight className={cn(className, 'rotate-180')} /> : ChevronRight;
  const items = [
    { label: t('tools_hub.exercises'), path: 'Exercises', Icon: Dumbbell },
    { label: t('tools_hub.forms'), path: 'TherapeuticForms', Icon: BookOpenCheck },
    { label: t('tools_hub.videos'), path: 'Videos', Icon: PlaySquare },
    { label: t('tools_hub.games'), path: 'ExperientialGames', Icon: Gamepad2 },
    { label: t('tools_hub.journeys'), path: 'Journeys', Icon: Route },
    { label: t('tools_hub.resources'), path: 'Resources', Icon: Library },
  ];

  return (
    <main className="page-container mx-auto min-h-[100dvh] max-w-5xl px-4 pb-28 pt-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_64px_rgba(36,105,92,0.14)] backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{t('daily_path.eyebrow')}</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{t('tools_hub.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('tools_hub.subtitle')}</p>
      </header>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ label, path, Icon }) => (
          <Link key={path} to={createPageUrl(path)} className="group">
            <Card className="flex min-h-[142px] flex-col rounded-[26px] border-teal-100 bg-gradient-to-br from-white to-teal-50/60 p-5 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:border-teal-300 group-hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700"><Icon className="h-5 w-5" /></span>
              <span className="mt-4 font-bold text-slate-900">{label}</span>
              <span className="mt-2 inline-flex items-center text-xs font-bold text-teal-700">{t('tools_hub.open')}<Arrow className="ms-1 h-3.5 w-3.5" /></span>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
