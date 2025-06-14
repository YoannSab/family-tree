import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
import translationEN from './locales/en.json';
import translationFR from './locales/fr.json';
import translationIT from './locales/it.json';

const resources = {
  en: {
    translation: translationEN
  },
  fr: {
    translation: translationFR
  },
  it: {
    translation: translationIT
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // French as default fallback
    debug: false,
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;
