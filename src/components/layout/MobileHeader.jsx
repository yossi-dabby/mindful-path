import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { createPageUrl } from '../../utils';
import { useTabNavigation } from './TabNavigationProvider';
import MobileMenu from './MobileMenu';
import NotificationBell from '../notifications/NotificationBell';
import { useTranslation } from 'react-i18next';

export const MOBILE_HEADER_HEIGHT = 60; // Height of mobile header nav area in px (excluding safe area)

export default function MobileHeader({ currentPageName: currentPageNameProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const tabNav = useTabNavigation();
  const { t } = useTranslation();
  const currentPath = location.pathname;

  // Prefer the prop; fall back to what the TabNavigationProvider knows
  const currentPageName = currentPageNameProp ?? tabNav?.currentPageName;

  // Show the Back button when the tab navigation stack has history to go back to,
  // OR when the URL has more than one path segment (genuine sub-route).
  const pathSegments = currentPath.split('/').filter(Boolean);
  const isSubRoute = pathSegments.length > 1 || !!tabNav?.canGoBack();

  // Get page title based on current page
  const getPageTitle = () => {
    const titles = {
      'Home': t('global.app_name'),
      'Chat': t('sidebar.chat.name'),
      'Coach': t('sidebar.coach.name'),
      'Journal': t('sidebar.journal.name'),
      'MoodTracker': t('mood_tracker.page_title'),
      'Exercises': t('sidebar.exercises.name'),
      'Goals': t('goals.nav_title'),
      'Progress': t('sidebar.progress.name'),
      'Settings': t('sidebar.settings.name'),
      'Community': t('sidebar.community.name'),
      'PersonalizedFeed': t('personalized_feed.nav_title'),
      'ThoughtCoach': t('thought_coach.title'),
      'ExerciseView': t('exercise_view.nav_title'),
      'GoalCoach': t('goal_coach_wizard.title')
    };
    return titles[currentPageName] || t('global.app_name');
  };

  const handleBack = () => {
    // Use tab navigation if available for stack-aware back
    if (tabNav?.canGoBack()) {
      const didGoBack = tabNav.goBackInTab();
      if (didGoBack) return;
    }

    // Fallback to browser history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(createPageUrl('Home'));
    }
  };

  return (
    <header
      className="md:hidden fixed top-0 left-0 right-0 border-b border-border/70 bg-[hsl(var(--sidebar-background)/0.88)] backdrop-blur-2xl z-40"
      style={{
        height: 'calc(60px + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)'
      }}>

      <div className="flex items-center justify-between h-full px-4">
        {/* Start: Back button on child routes, logo on root */}
        <div className="w-12">
          {isSubRoute ?
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full"
            aria-label={t('common.back')}>

              <ChevronLeft className="w-6 h-6 rtl:scale-x-[-1] text-primary" />
            </Button> :

          <div className="bg-teal-600 text-primary-foreground rounded-3xl w-8 h-8 flex items-center justify-center shadow-[var(--shadow-sm)]"

          aria-hidden="true">

              <span className="text-white font-bold text-sm">M</span>
            </div>
          }
        </div>

        {/* Center: Page title */}
        <p className="text-teal-600 font-semibold truncate">


          {getPageTitle()}
        </p>

        {/* End: Notification bell + Menu button */}
        <div className="flex items-center gap-1 justify-end">
          <NotificationBell />
          <MobileMenu />
        </div>
      </div>
    </header>);

}