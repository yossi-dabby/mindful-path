import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { cn } from "@/lib/utils";
import { Home, MessageCircle, BookOpen, Activity, Dumbbell, Heart, Users, Settings } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import { useTranslation } from 'react-i18next';

export const SIDEBAR_WIDTH = 288; // 72 * 4 = 288px (w-72)

export default function Sidebar({ currentPageName }) {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
  { name: t('sidebar.home.name'), icon: Home, path: 'Home', description: t('sidebar.home.description') },
  { name: t('sidebar.chat.name'), icon: MessageCircle, path: 'Chat', description: t('sidebar.chat.description') },
  { name: t('sidebar.coach.name'), icon: Heart, path: 'Coach', description: t('sidebar.coach.description') },
  { name: t('sidebar.mood.name'), icon: Activity, path: 'MoodTracker', description: t('sidebar.mood.description') },
  { name: t('sidebar.journal.name'), icon: BookOpen, path: 'Journal', description: t('sidebar.journal.description') },
  { name: t('sidebar.progress.name'), icon: Activity, path: 'Progress', description: t('sidebar.progress.description') },
  { name: t('sidebar.exercises.name'), icon: Dumbbell, path: 'Exercises', description: t('sidebar.exercises.description') }];


  const secondaryItems = [
  { name: t('sidebar.community.name'), icon: Users, path: 'Community' },
  { name: t('sidebar.resources.name'), icon: BookOpen, path: 'Resources' },
  { name: t('sidebar.settings.name'), icon: Settings, path: 'Settings' }];


  return (
    <nav
      aria-label="Main navigation" className="bg-teal-100 py-6 rounded-2xl hidden md:flex fixed left-0 top-0 bottom-0 flex-col border-r border-border/70 backdrop-blur-2xl shadow-[var(--shadow-lg)]"

      style={{
        zIndex: 35,
        width: `${SIDEBAR_WIDTH}px`
      }}>

      {/* Logo */}
      <div className="bg-teal-100 mb-8 px-6">
        <div className="bg-teal-100 text-teal-600 flex items-center gap-3">
          <div className="bg-teal-400 text-teal-500 rounded-[20px] w-10 h-10 flex items-center justify-center shadow-[var(--shadow-md)]">
            <span className="bg-teal-400 text-teal-600 text-lg font-bold">M</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-teal-600 font-semibold truncate">{t('global.app_name')}</h1>
            <p className="text-teal-600 text-xs truncate">{t('global.app_tagline')}</p>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-teal-50 text-teal-600 px-3 flex-1 overflow-y-auto" style={{ overscrollBehavior: 'none' }}>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const targetPath = createPageUrl(item.path);
            const isActive = currentPageName === item.path || location.pathname === targetPath || location.pathname === `/${item.path}`;
            return (
              <Link
                key={item.path}
                to={targetPath}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  "px-4 py-3 rounded-2xl flex items-center gap-3 transition-calm group border shadow-[var(--shadow-sm)]",
                  isActive
                    ? "bg-teal-200 text-foreground border-teal-400"
                    : "bg-teal-50 text-foreground border-border/70"
                )}>







                <Icon className="text-teal-600 lucide lucide-house w-5 h-5 icon-default scale-110" strokeWidth={2} />
                <div className="flex-1">
                  <p className="bg-teal-50 text-teal-600 font-semibold leading-5">{item.name}</p>
                  {item.description &&
                  <p className="text-teal-600 mt-0.5 text-xs leading-4">{item.description}</p>
                  }
                </div>
                {isActive &&
                <div className="bg-primary text-teal-600 rounded-full w-1 h-6 shadow-[var(--shadow-sm)]" />
                }
              </Link>);

          })}
        </div>

        {/* Secondary Items */}
        <div className="mt-8 pt-6 border-t border-border/70">
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const targetPath = createPageUrl(item.path);
              const isActive = currentPageName === item.path || location.pathname === targetPath || location.pathname === `/${item.path}`;
              return (
                <Link
                  key={item.path}
                  to={targetPath}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-control)] border transition-calm",
                    isActive ?
                    "border-border/70 bg-card text-foreground shadow-[var(--shadow-sm)]" :
                    "border-transparent text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}>

                  <Icon className="text-teal-600 lucide lucide-users w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-teal-600 text-sm">{item.name}</span>
                </Link>);

            })}
          </div>
        </div>
      </div>
    </nav>);

}