import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { cn } from "@/lib/utils";
import { Home, MessageCircle, BookOpen, Activity, Dumbbell, Heart } from 'lucide-react';

// CRITICAL: This height MUST match the padding-bottom in AppContent
export const BOTTOM_NAV_HEIGHT = 80; // 20 * 4 = 80px (h-20)

const navItems = [
  { name: 'Home', icon: Home, path: 'Home' },
  { name: 'Chat', icon: MessageCircle, path: 'Chat' },
  { name: 'Coach', icon: Heart, path: 'Coach' },
  { name: 'Mood', icon: Activity, path: 'MoodTracker' },
  { name: 'Journal', icon: BookOpen, path: 'Journal' },
  { name: 'Exercises', icon: Dumbbell, path: 'Exercises' }
];

export default function BottomNav({ currentPageName }) {
  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t shadow-lg z-50"
      style={{ 
        height: `${BOTTOM_NAV_HEIGHT}px`,
        background: 'linear-gradient(to top, rgba(240, 249, 247, 0.98) 0%, rgba(232, 246, 243, 0.95) 100%)',
        borderColor: 'rgba(38, 166, 154, 0.2)',
        boxShadow: '0 -4px 16px rgba(38, 166, 154, 0.08)'
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