import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, MessageCircle, BookOpen, Activity, Dumbbell, Settings, Heart, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import AiCompanion from './components/ai/AiCompanion';

export default function Layout({ children, currentPageName }) {
  const [theme, setTheme] = React.useState('default');

  React.useEffect(() => {
    // Load user theme preference
    base44.auth.me().then((user) => {
      const userTheme = user?.preferences?.theme || 'default';
      setTheme(userTheme);
      
      // Apply theme colors
      const themeColors = {
        default: { primary: '139 178 158', secondary: '185 163 193', accent: '244 146 131' },
        ocean: { primary: '14 165 233', secondary: '6 182 212', accent: '20 184 166' },
        sunset: { primary: '249 115 22', secondary: '236 72 153', accent: '251 146 60' },
        forest: { primary: '16 185 129', secondary: '34 197 94', accent: '132 204 22' },
        lavender: { primary: '168 85 247', secondary: '139 92 246', accent: '217 70 239' },
        minimal: { primary: '71 85 105', secondary: '100 116 139', accent: '51 65 85' }
      };
      
      const colors = themeColors[userTheme] || themeColors.default;
      document.documentElement.style.setProperty('--color-primary', colors.primary);
      document.documentElement.style.setProperty('--color-secondary', colors.secondary);
      document.documentElement.style.setProperty('--color-accent', colors.accent);
    }).catch(() => {
      // User not logged in, use default theme
    });
  }, []);

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

  const themeBackgrounds = {
    default: 'bg-warm-gradient',
    ocean: 'bg-calm-gradient',
    sunset: 'bg-warm-gradient',
    forest: 'bg-gradient-to-br from-emerald-50/30 via-white to-green-50/20',
    lavender: 'bg-gradient-to-br from-purple-50/30 via-white to-violet-50/20',
    minimal: 'bg-gradient-to-br from-gray-50/30 via-white to-slate-50/20'
  };

  return (
    <div className={`min-h-screen ${themeBackgrounds[theme] || themeBackgrounds.default}`}>
      <style>{`
        :root {
          --color-primary: 139 178 158;
          --color-secondary: 185 163 193;
          --color-accent: 244 146 131;
          --color-background: 255 255 255;
          --color-text: 45 55 72;
        }
      `}</style>

      {/* AI Companion Widget */}
      <AiCompanion />
      
      <motion.div 
        className="pb-20 md:pb-0 md:pl-72"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t shadow-lg z-50" style={{ borderColor: 'rgb(var(--border))' }}>
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.path;
            return (
              <Link
                key={item.path}
                to={createPageUrl(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 py-1.5 transition-calm",
                  isActive 
                    ? "text-[rgb(var(--accent))]" 
                    : "text-[rgb(var(--muted))]"
                )}
                style={{ borderRadius: 'var(--r-sm)' }}
              >
                <Icon className={cn("w-5 h-5 icon-default", isActive && "scale-110")} strokeWidth={2} />
                <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 bg-white/95 backdrop-blur-xl border-r shadow-sm flex-col py-6 z-50" style={{ borderColor: 'rgb(var(--border))' }}>
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
        <div className="flex-1 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.path;
              return (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-calm group",
                    isActive 
                      ? "shadow-sm" 
                      : ""
                  )}
                  style={{ 
                    borderRadius: 'var(--r-md)',
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
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all",
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
    </div>
  );
}