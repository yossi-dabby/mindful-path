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
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t shadow-lg z-50"
      style={{ 
        height: `${BOTTOM_NAV_HEIGHT}px`,
        borderColor: 'rgb(var(--border))' 
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
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-1.5 transition-calm rounded-lg",
                isActive 
                  ? "text-[rgb(var(--accent))]" 
                  : "text-[rgb(var(--muted))]"
              )}
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