import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

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
  const currentLang = i18n.language;

  const handleLanguageChange = async (langCode) => {
    // Change language in i18n
    await i18n.changeLanguage(langCode);
    
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
    <Card className="border-0" style={{
      borderRadius: '24px',
      background: 'linear-gradient(135deg, rgba(224, 242, 241, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 3px 12px rgba(38, 166, 154, 0.1), 0 1px 3px rgba(0,0,0,0.04)'
    }}>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-gray-600" />
          {t('settings.language.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-sm text-gray-600 mb-4">
          {t('settings.language.description')}
        </p>
        
        {/* Language Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {languages.map((lang, index) => {
            const isSelected = currentLang === lang.code;
            
            return (
              <motion.button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  'relative p-4 rounded-xl border-2 transition-all text-left',
                  isSelected
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <h3 className={cn(
                        "font-semibold text-gray-800",
                        lang.rtl && "text-right"
                      )}>
                        {lang.native}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {t(`settings.language.${lang.code}`)}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
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
            );
          })}
        </div>
        
        {/* Current Language Display */}
        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>{t('settings.language.current')}:</strong>{' '}
            {languages.find(l => l.code === currentLang)?.native || 'English'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}