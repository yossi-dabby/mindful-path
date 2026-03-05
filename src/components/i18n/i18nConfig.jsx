
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from './translations';
import { applyMindGamesTranslations } from './translationsBuilder';

// Apply mind games UI + content translations to all languages
applyMindGamesTranslations(translations);

/**
 * Convert a dot-notation key into a human-readable fallback label.
 * e.g. "community.page_title" → "Page Title"
 */
function keyToHumanFallback(key) {
  const leaf = key.split('.').pop() || key;
  return leaf
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: translations,
    fallbackLng: 'en',
    lng: localStorage.getItem('language') || 'en',
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    
    interpolation: {
      escapeValue: false
    },
    
    react: {
      useSuspense: false
    },

    // Warn on missing keys and return a human-readable fallback instead of raw key strings
    saveMissing: true,
    missingKeyHandler: (lngs, ns, key) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] Missing translation key: "${key}" (langs: ${lngs.join(', ')}, ns: ${ns})`);
      }
    },
    parseMissingKeyHandler: (key) => keyToHumanFallback(key),
  });

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  
  // Update HTML dir attribute for RTL support
  document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial dir on load
document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

export default i18n;
