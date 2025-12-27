import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, MessageCircle, BookOpen, Activity, Dumbbell, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Home', icon: Home, path: 'Home' },
    { name: 'Chat', icon: MessageCircle, path: 'Chat' },
    { name: 'Journal', icon: BookOpen, path: 'Journal' },
    { name: 'Progress', icon: Activity, path: 'Progress' },
    { name: 'Exercises', icon: Dumbbell, path: 'Exercises' },
    { name: 'Settings', icon: Settings, path: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-purple-50/30">
      <style>{`
        :root {
          --color-primary: 139 178 158;
          --color-secondary: 185 163 193;
          --color-accent: 244 146 131;
          --color-background: 255 255 255;
          --color-text: 45 55 72;
        }
      `}</style>
      
      <div className="pb-20 md:pb-0 md:pl-20">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.path;
            return (
              <Link
                key={item.path}
                to={createPageUrl(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all",
                  isActive 
                    ? "text-green-700" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex-col items-center py-8 gap-6 z-50">
        <div className="mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-purple-400 flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPageName === item.path;
          return (
            <Link
              key={item.path}
              to={createPageUrl(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all group relative",
                isActive 
                  ? "text-green-700" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "scale-110")} />
              <span className="text-[9px] font-medium">{item.name}</span>
              
              {/* Tooltip on hover */}
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}