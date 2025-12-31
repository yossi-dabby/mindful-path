import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { cn } from "@/lib/utils";
import { Home, MessageCircle, BookOpen, Activity, Dumbbell, Heart, Users, Settings } from 'lucide-react';

export const SIDEBAR_WIDTH = 288; // 72 * 4 = 288px (w-72)

const navItems = [
  { name: 'Home', icon: Home, path: 'Home', description: 'Dashboard & overview' },
  { name: 'Chat', icon: MessageCircle, path: 'Chat', description: 'AI Therapist' },
  { name: 'Coach', icon: Heart, path: 'Coach', description: 'AI Wellness Coach' },
  { name: 'Mood', icon: Activity, path: 'MoodTracker', description: 'Track your mood' },
  { name: 'Journal', icon: BookOpen, path: 'Journal', description: 'Thought records' },
  { name: 'Progress', icon: Activity, path: 'Progress', description: 'Track your journey' },
  { name: 'Exercises', icon: Dumbbell, path: 'Exercises', description: 'CBT techniques' }
];

const secondaryItems = [
  { name: 'Community', icon: Users, path: 'Community' },
  { name: 'Resources', icon: BookOpen, path: 'Resources' },
  { name: 'Settings', icon: Settings, path: 'Settings' }
];

export default function Sidebar({ currentPageName }) {
  return (
    <nav 
      className="hidden md:flex fixed left-0 top-0 bottom-0 bg-white/95 backdrop-blur-xl border-r shadow-sm flex-col py-6 z-50"
      style={{ 
        width: `${SIDEBAR_WIDTH}px`,
        borderColor: 'rgb(var(--border))' 
      }}
    >
      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center shadow-md" style={{ 
            borderRadius: 'var(--r-lg)',
            background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--calm)))'
          }}>
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'rgb(var(--text))' }}>MindWell</h1>
            <p className="text-xs" style={{ color: 'rgb(var(--muted))' }}>Mental Wellness App</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.path;
            return (
              <Link
                key={item.path}
                to={createPageUrl(item.path)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-calm group rounded-lg",
                  isActive && "shadow-sm"
                )}
                style={{ 
                  backgroundColor: isActive ? 'rgb(var(--accent) / 0.1)' : 'transparent',
                  color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--muted))'
                }}
              >
                <Icon className={cn("w-5 h-5 icon-default", isActive && "scale-110")} strokeWidth={2} />
                <div className="flex-1">
                  <p className={cn("text-sm font-medium", isActive && "font-semibold")}>{item.name}</p>
                  {item.description && (
                    <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--muted))' }}>{item.description}</p>
                  )}
                </div>
                {isActive && (
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: 'rgb(var(--accent))' }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary Items */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgb(var(--border))' }}>
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.path;
              return (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all",
                    isActive 
                      ? "bg-green-50 text-green-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className={cn("text-sm", isActive && "font-semibold")}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}