import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations, Language } from '../lib/i18n';
import { Country } from '../types';

type Translations = typeof translations.es;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations, ...args: any[]) => string;
  getCountryName: (countryOrCode: Country | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('saltex_lang') as Language;
      if (saved === 'en' || saved === 'es') return saved;
    } catch {}
    return 'es';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('saltex_lang', newLang);
    } catch {}
  };

  const t = (key: keyof Translations, ...args: any[]): string => {
    const stringOrFn = translations[language]?.[key] ?? translations['es']?.[key];
    
    if (stringOrFn === undefined) {
      console.warn(`Translation key not found: ${String(key)}`);
      return String(key);
    }

    if (typeof stringOrFn === 'function') {
      return (stringOrFn as (...args: any[]) => string)(...args);
    }
    return stringOrFn as string;
  };

  const getCountryName = (countryOrCode: Country | string): string => {
    const code = typeof countryOrCode === 'string' 
      ? countryOrCode.toLowerCase() 
      : countryOrCode.code.toLowerCase();
      
    const key = `country_${code}` as keyof Translations;
    if (translations[language]?.[key]) {
      return translations[language][key] as string;
    }
    
    if (typeof countryOrCode !== 'string' && countryOrCode.name) {
      return countryOrCode.name;
    }
    return code.toUpperCase();
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getCountryName }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
