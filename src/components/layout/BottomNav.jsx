import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { cn } from "@/lib/utils";
import { Home, MessageCircle, BookOpen, Activity, Dumbbell, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTabNavigation } from './TabNavigationProvider';
import { getScrollContainer } from '@/lib/scrollContainer';

// CRITICAL: This height MUST match the padding-bottom in AppContent
export const BOTTOM_NAV_HEIGHT = 80; // 20 * 4 = 80px (h-20)

export default function BottomNav({ currentPageName }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tabNav = useTabNavigation();

  const navItems = [
  { name: t('sidebar.home.name'), icon: Home, path: 'Home' },
  { name: t('sidebar.chat.name'), icon: MessageCircle, path: 'Chat' },
  { name: t('sidebar.coach.name'), icon: Heart, path: 'Coach' },
  { name: t('sidebar.journal.name'), icon: BookOpen, path: 'Journal' },
  { name: t('sidebar.mood.name'), icon: Activity, path: 'MoodTracker' },
  { name: t('sidebar.exercises.name'), icon: Dumbbell, path: 'Exercises' }];


  const handleTabClick = (e, item) => {
    e.preventDefault();

    // Use tab navigation context for independent stacks
    if (tabNav) {
      tabNav.switchToTab(item.path);
    } else {
      // Fallback behavior
      if (currentPageName === item.path) {
        navigate(createPageUrl(item.path), { replace: true });
        requestAnimationFrame(() => {
          getScrollContainer().scrollTo({ top: 0, behavior: 'smooth' });
        });
      } else {
        navigate(createPageUrl(item.path));
      }
    }
  };

  return (
    <nav
      aria-label="Main navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/70 bg-[hsl(var(--sidebar-background)/0.9)] backdrop-blur-2xl shadow-[var(--shadow-lg)]"
      style={{
        zIndex: 35,
        height: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}>

      <div className="bg-teal-500 text-gray-950 px-1 flex justify-around items-center h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPageName === item.path;
          return (
            <Link
              key={item.path}
              to={createPageUrl(item.path)}
              onClick={(e) => handleTabClick(e, item)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.name}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-calm px-2 py-2 rounded-3xl min-w-[52px] border',
                isActive ?
                'bg-primary/15 border-primary/30 shadow-[var(--shadow-sm)]' :
                'bg-transparent border-transparent'
              )}>






              
              <Icon
                className={cn('w-5 h-5 icon-default', isActive ? 'text-primary scale-110' : 'text-muted-foreground')}
                strokeWidth={isActive ? 2.5 : 2} />
              
              <span className={cn('text-xs font-medium leading-none', isActive ? 'text-primary' : 'text-muted-foreground')}>{item.name}</span>
            </Link>);

        })}
      </div>
    </nav>);

}