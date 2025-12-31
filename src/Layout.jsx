import React from 'react';
import { base44 } from '@/api/base44Client';
import AiCompanion from './components/ai/AiCompanion';
import BottomNav from './components/layout/BottomNav';
import Sidebar from './components/layout/Sidebar';
import AppContent from './components/layout/AppContent';

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

  const themeBackgrounds = {
    default: 'bg-warm-gradient',
    ocean: 'bg-calm-gradient',
    sunset: 'bg-warm-gradient',
    forest: 'bg-gradient-to-br from-emerald-50/30 via-white to-green-50/20',
    lavender: 'bg-gradient-to-br from-purple-50/30 via-white to-violet-50/20',
    minimal: 'bg-gradient-to-br from-gray-50/30 via-white to-slate-50/20'
  };

  return (
    <div className={`min-h-screen overflow-hidden ${themeBackgrounds[theme] || themeBackgrounds.default}`}>
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
      
      {/* Sidebar - Desktop only */}
      <Sidebar currentPageName={currentPageName} />
      
      {/* Main Content - Single scroll container */}
      <AppContent currentPageName={currentPageName}>
        {children}
      </AppContent>
      
      {/* Bottom Navigation - Mobile only */}
      <BottomNav currentPageName={currentPageName} />
    </div>
  );
}