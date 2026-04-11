import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';

i18n
  .use(LanguageDetector) // Browser ki language detect karne ke liye
  .use(initReactI18next) // React ke saath jodne ke liye
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi }
    },
    fallbackLng: 'en', // Agar language na mile toh English dikhao
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;