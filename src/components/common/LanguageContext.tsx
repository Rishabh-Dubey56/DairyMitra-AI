'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/lib/translations';
import { farmStore } from '@/lib/store';

type TranslationsType = typeof translations['en'];

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationsType;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const savedSettings = farmStore.getSettings();
      if (savedSettings?.language) {
        setLanguageState(savedSettings.language);
      }
    } catch {
      // ignore
    }

    const handleUpdate = () => {
      const savedSettings = farmStore.getSettings();
      if (savedSettings?.language && savedSettings.language !== language) {
        setLanguageState(savedSettings.language);
      }
    };

    window.addEventListener('dairymitra_storage_updated', handleUpdate);
    return () => window.removeEventListener('dairymitra_storage_updated', handleUpdate);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      const current = farmStore.getSettings();
      farmStore.saveSettings({ ...current, language: lang });
    } catch {
      // ignore
    }
  };

  const currentTranslations = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
