import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function ThemeSelector({ currentTheme, onThemeChange }) {
  const { t } = useTranslation();
  
  const themes = [
    {
      id: 'default',
      name: t('settings.theme.default.name'),
      description: t('settings.theme.default.description'),
      preview: 'bg-gradient-to-br from-green-50 via-purple-50 to-blue-50',
      colors: {
        primary: '139 178 158',
        secondary: '185 163 193',
        accent: '244 146 131'
      }
    },
    {
      id: 'ocean',
      name: t('settings.theme.ocean.name'),
      description: t('settings.theme.ocean.description'),
      preview: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50',
      colors: {
        primary: '14 165 233',
        secondary: '6 182 212',
        accent: '20 184 166'
      }
    },
    {
      id: 'sunset',
      name: t('settings.theme.sunset.name'),
      description: t('settings.theme.sunset.description'),
      preview: 'bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50',
      colors: {
        primary: '249 115 22',
        secondary: '236 72 153',
        accent: '251 146 60'
      }
    },
    {
      id: 'forest',
      name: t('settings.theme.forest.name'),
      description: t('settings.theme.forest.description'),
      preview: 'bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50',
      colors: {
        primary: '16 185 129',
        secondary: '34 197 94',
        accent: '132 204 22'
      }
    },
    {
      id: 'lavender',
      name: t('settings.theme.lavender.name'),
      description: t('settings.theme.lavender.description'),
      preview: 'bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50',
      colors: {
        primary: '168 85 247',
        secondary: '139 92 246',
        accent: '217 70 239'
      }
    },
    {
      id: 'minimal',
      name: t('settings.theme.minimal.name'),
      description: t('settings.theme.minimal.description'),
      preview: 'bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50',
      colors: {
        primary: '71 85 105',
        secondary: '100 116 139',
        accent: '51 65 85'
      }
    }
  ];
  
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          {t('settings.theme.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          {t('settings.theme.description')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {themes.map((theme, index) => (
            <motion.button
              key={theme.id}
              onClick={() => onThemeChange(theme)}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all text-left',
                currentTheme === theme.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className={cn('h-20 rounded-lg mb-3', theme.preview)} />
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{theme.name}</h3>
                  <p className="text-xs text-gray-500">{theme.description}</p>
                </div>
                {currentTheme === theme.id && (
                  <motion.div 
                    className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}