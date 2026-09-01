import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import {
  Activity,
  BookOpen,
  Dumbbell,
  Heart,
  Home,
  Menu,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X
} from 'lucide-react';
import { Drawer, DrawerContent, DrawerClose, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isRtl = i18n.dir() === 'rtl';

  const mainItems = [
    { name: t('sidebar.home.name'), description: t('sidebar.home.description'), icon: Home, path: 'Home' },
    { name: t('sidebar.chat.name'), description: t('sidebar.chat.description'), icon: MessageCircle, path: 'Chat' },
    { name: t('sidebar.coach.name'), description: t('sidebar.coach.description'), icon: Heart, path: 'Coach' },
    { name: t('sidebar.mood.name'), description: t('sidebar.mood.description'), icon: Activity, path: 'MoodTracker' },
    { name: t('sidebar.journal.name'), description: t('sidebar.journal.description'), icon: BookOpen, path: 'Journal' },
    { name: t('sidebar.progress.name'), description: t('sidebar.progress.description'), icon: Activity, path: 'Progress' },
    { name: t('sidebar.exercises.name'), description: t('sidebar.exercises.description'), icon: Dumbbell, path: 'Exercises' }
  ];

  const secondaryItems = [
    { name: t('sidebar.community.name'), icon: Users, path: 'Community', testId: 'mobile-nav-community' },
    { name: t('sidebar.resources.name'), icon: BookOpen, path: 'Resources', testId: 'mobile-nav-resources' },
    { name: t('sidebar.settings.name'), icon: Settings, path: 'Settings', testId: 'mobile-nav-settings' }
  ];

  const isActive = (path) => location.pathname.toLowerCase().includes('/' + path.toLowerCase());

  const renderItem = (item, compact = false) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        key={item.path}
        to={createPageUrl(item.path)}
        data-testid={item.testId}
        onClick={() => setOpen(false)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group flex min-h-[56px] min-w-0 items-center gap-3 rounded-2xl border px-3.5 py-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
          active
            ? 'border-teal-300/80 bg-white text-teal-900 shadow-[0_10px_30px_rgba(15,118,110,0.14)]'
            : 'border-transparent text-slate-700 hover:border-white/80 hover:bg-white/70'
        )}
      >
        <span className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
          active ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white' : 'bg-white/80 text-teal-700'
        )}>
          <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{item.name}</span>
          {!compact && item.description && (
            <span className="mt-0.5 block truncate text-xs text-slate-500">{item.description}</span>
          )}
        </span>
        {active && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />}
      </Link>
    );
  };

  return (
    <div className="md:hidden" data-app-chrome>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="mobile-menu-button"
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-teal-200/80 bg-white/75 text-teal-700 shadow-sm transition-all hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        aria-label={t('mobile_menu.open_aria')}
        aria-expanded={open}
        aria-controls="premium-mobile-menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <Drawer open={open} onOpenChange={setOpen} direction={isRtl ? 'right' : 'left'} shouldScaleBackground={false}>
        <DrawerContent
          id="premium-mobile-menu"
          data-testid="mobile-drawer"
          className="m-0 flex max-h-none flex-col overflow-hidden border-teal-200/70 bg-transparent p-0 shadow-2xl"
          style={{
            top: 0,
            bottom: 0,
            left: isRtl ? 'auto' : 0,
            right: isRtl ? 0 : 'auto',
            width: 'min(88vw, 360px)',
            height: '100dvh',
            borderRadius: isRtl ? '28px 0 0 28px' : '0 28px 28px 0',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(236,253,245,0.98),rgba(240,253,250,0.96)_48%,rgba(255,255,255,0.98))]" aria-hidden="true" />
          <div className="absolute -top-16 end-[-72px] h-56 w-56 rounded-full bg-teal-200/45 blur-2xl" aria-hidden="true" />
          <div className="absolute -bottom-20 start-[-80px] h-60 w-60 rounded-full bg-emerald-100/70 blur-2xl" aria-hidden="true" />

          <div className="relative flex items-start justify-between gap-4 border-b border-teal-200/60 px-5 pb-5 pt-[calc(env(safe-area-inset-top,0px)+20px)]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <DrawerTitle className="truncate text-xl font-bold text-teal-900">{t('global.app_name')}</DrawerTitle>
                <p className="mt-1 text-xs leading-5 text-teal-800/70">{t('mobile_menu.subtitle')}</p>
              </div>
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-sm transition-colors hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                aria-label={t('mobile_menu.close_aria')}
              >
                <X className="h-5 w-5" />
              </button>
            </DrawerClose>
          </div>

          <nav
            className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-5"
            aria-label={t('shell.additional_navigation')}
            data-app-chrome
          >
            <section aria-labelledby="mobile-menu-main-title">
              <h2 id="mobile-menu-main-title" className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-800/60">
                {t('mobile_menu.main_section')}
              </h2>
              <div className="mt-2 space-y-1.5">
                {mainItems.map((item) => renderItem(item))}
              </div>
            </section>

            <section className="mt-6 border-t border-teal-200/60 pt-5" aria-labelledby="mobile-menu-more-title">
              <h2 id="mobile-menu-more-title" className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-800/60">
                {t('mobile_menu.more_section')}
              </h2>
              <div className="mt-2 space-y-1.5">
                {secondaryItems.map((item) => renderItem(item, true))}
              </div>
            </section>
          </nav>

          <div className="relative border-t border-teal-200/60 p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 p-3 text-start shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <p className="text-xs leading-5 text-slate-600">{t('mobile_menu.footer_note')}</p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
