import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { changeAppLocale, getCurrentAppLocale } from '../i18n/appLocale';

const languages = [
  { code: 'en', flag: '🇬🇧', native: 'English' },
  { code: 'he', flag: '🇮🇱', native: 'עברית', rtl: true },
  { code: 'es', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', flag: '🇫🇷', native: 'Français' },
  { code: 'de', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'it', flag: '🇮🇹', native: 'Italiano' },
  { code: 'pt', flag: '🇧🇷', native: 'Português' }
];

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const currentLang = getCurrentAppLocale(i18n);

  const handleLanguageChange = async (langCode) => {
    // Change the UI language and all document/storage side effects atomically.
    await changeAppLocale(i18n, langCode);
    
    // Save to user preferences (optional, non-blocking)
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        preferences: {
          ...user.preferences,
          language: langCode
        }
      });
    } catch (error) {
      console.log('Could not save language preference to user profile:', error);
      // Non-blocking: language still works via localStorage
    }
  };

  return (
    <Card className="settings-surface overflow-hidden border border-white/80 bg-white/80 shadow-[0_16px_50px_rgba(15,118,110,0.10)] backdrop-blur-xl">
      <CardHeader className="border-b border-teal-100/80 p-5 sm:p-6">
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-gray-600" />
          {t('settings.language.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <p className="text-sm text-gray-600 mb-4">
          {t('settings.language.description')}
        </p>
        
        {/* Language Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {languages.map((lang, index) => {
            const isSelected = currentLang === lang.code;
            
            return (
              <motion.button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  'relative min-h-[78px] p-4 rounded-2xl border-2 transition-all text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                  isSelected
                    ? 'border-teal-500 bg-teal-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-teal-200 hover:shadow-sm'
                )}
                whileTap={{ scale: 0.99 }}
                aria-pressed={isSelected}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-2xl flex-shrink-0">{lang.flag}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className={cn(
                        "font-semibold text-gray-800 truncate",
                        lang.rtl && "text-right"
                      )}>
                        {lang.native}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {t(`settings.language.${lang.code}`)}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div 
                      className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 ms-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
        
        {/* Current Language Display */}
        <div className="mt-4 p-3 rounded-2xl bg-teal-50 border border-teal-200">
          <p className="text-xs text-teal-800">
            <strong>{t('settings.language.current')}:</strong>{' '}
            {languages.find(l => l.code === currentLang)?.native || 'English'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}