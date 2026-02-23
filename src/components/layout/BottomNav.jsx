import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { cn } from "@/lib/utils";
import { Home, MessageCircle, BookOpen, Activity, Dumbbell, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// CRITICAL: This height MUST match the padding-bottom in AppContent
export const BOTTOM_NAV_HEIGHT = 80; // 20 * 4 = 80px (h-20)

export default function BottomNav({ currentPageName }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const navItems = [
    { name: t('sidebar.home.name'), icon: Home, path: 'Home' },
    { name: t('sidebar.chat.name'), icon: MessageCircle, path: 'Chat' },
    { name: t('sidebar.coach.name'), icon: Heart, path: 'Coach' },
    { name: t('sidebar.journal.name'), icon: BookOpen, path: 'Journal' },
    { name: t('sidebar.mood.name'), icon: Activity, path: 'MoodTracker' },
    { name: t('sidebar.exercises.name'), icon: Dumbbell, path: 'Exercises' }
  ];

  // Preserve scroll position and navigation state for each tab
  React.useEffect(() => {
    const scrollKey = `scroll_${currentPageName}`;
    const savedScroll = sessionStorage.getItem(scrollKey);
    
    // Restore scroll position when returning to a tab
    if (savedScroll) {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedScroll));
      });
    }

    // Save scroll position continuously
    const handleScroll = () => {
      sessionStorage.setItem(scrollKey, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPageName]);

  // Save navigation state when tab changes
  React.useEffect(() => {
    const navStateKey = `navState_${currentPageName}`;
    const currentPath = window.location.pathname;
    
    // Store the current path for this tab
    sessionStorage.setItem(navStateKey, currentPath);
  }, [currentPageName]);

  const handleTabClick = (e, item) => {
    // If clicking the already active tab, navigate to root of that section
    if (currentPageName === item.path) {
      e.preventDefault();
      // Clear scroll position and navigate to root
      sessionStorage.removeItem(`scroll_${item.path}`);
      sessionStorage.removeItem(`navState_${item.path}`);
      navigate(createPageUrl(item.path), { replace: true });
      // Scroll to top after navigation
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };
  
  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t shadow-lg"
      style={{
        zIndex: 35, 
        height: `${BOTTOM_NAV_HEIGHT}px`,
        background: 'linear-gradient(to top, rgba(212, 237, 232, 0.95) 0%, rgba(200, 230, 225, 0.92) 100%)',
        borderColor: 'rgba(38, 166, 154, 0.25)',
        boxShadow: '0 -6px 20px rgba(38, 166, 154, 0.14)'
      }}
    >
      <div className="flex justify-around items-center h-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPageName === item.path;
          return (
            <Link
              key={item.path}
              to={createPageUrl(item.path)}
              onClick={(e) => handleTabClick(e, item)}
              className="flex flex-col items-center justify-center gap-1 px-2 py-2 transition-calm"
              style={{
                borderRadius: '16px',
                background: isActive 
                  ? 'linear-gradient(145deg, rgba(38, 166, 154, 0.15) 0%, rgba(56, 178, 172, 0.1) 100%)'
                  : 'transparent',
                color: isActive ? '#26A69A' : '#5A7A72'
              }}
            >
              <Icon className={cn("w-5 h-5 icon-default", isActive && "scale-110")} strokeWidth={2} />
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}