/**
 * Language & Currency Context
 * 
 * Provides global language and currency state across the app.
 * Refactored to use react-i18next for translations while maintaining existing API.
 */

import { createContext, useContext, useMemo, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from '@remix-run/react';
import { LANGUAGES, LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE, type Language, type TranslationKey, type LanguageConfig, t as i18nCustomT } from '~/utils/i18n/index';
import type { SupportedLocale, SupportedCurrency } from '~/utils/formatPrice';
import { useTranslation as useI18NextTranslation } from 'react-i18next';

interface LanguageContextValue {
  // Translation system
  lang: Language;
  t: (key: string | TranslationKey, options?: any) => string;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  
  // Language metadata
  currentLanguage: LanguageConfig | undefined;
  availableLanguages: LanguageConfig[];
  
  // Legacy compatibility
  locale: SupportedLocale;
  currency: SupportedCurrency;
  setLocale: (locale: SupportedLocale) => void;
  setCurrency: (currency: SupportedCurrency) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLang?: Language;
  defaultCurrency?: SupportedCurrency;
}

export function LanguageProvider({ 
  children, 
  defaultLang = DEFAULT_LANGUAGE,
  defaultCurrency = 'BDT'
}: LanguageProviderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t: i18nT, i18n } = useI18NextTranslation();
  
  // Get language from i18n or URL
  const urlLang = searchParams.get('lang') as Language | null;
  const lang = (i18n.language as Language) || defaultLang;
  
  // Sync URL with i18n
  useEffect(() => {
    if (urlLang && (urlLang === 'en' || urlLang === 'bn') && urlLang !== i18n.language) {
      i18n.changeLanguage(urlLang);
    }
  }, [urlLang, i18n]);

  const currency = (searchParams.get('currency') as SupportedCurrency) || defaultCurrency;
  
  const setLang = (newLang: Language) => {
    // Change i18next language
    i18n.changeLanguage(newLang);
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set('lang', newLang);
    setSearchParams(newParams, { preventScrollReset: true });
    
    // LocalStorage is handled by i18next-browser-languagedetector usually, 
    // but specific key might be needed if we customized it.
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch {}
  };
  
  const setCurrency = (newCurrency: SupportedCurrency) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('currency', newCurrency);
    setSearchParams(newParams, { preventScrollReset: true });
  };
  
  const toggleLang = () => {
    setLang(lang === 'en' ? 'bn' : 'en');
  };
  
  const t: (key: string | TranslationKey, options?: any) => string = (key, options) => {
    // 1. Try customs translations from ~/utils/i18n.ts first
    const customTranslation = i18nCustomT(key as TranslationKey, lang, options);
    
    // If it's not the same as the key, it means we found a translation
    if (customTranslation !== key) {
      return customTranslation;
    }

    // 2. Fallback to i18next (JSON files)
    return String(i18nT(key, options));
  };
  
  const currentLanguage = useMemo(() => {
    return LANGUAGES.find(l => l.code === lang);
  }, [lang]);
  
  const value = useMemo(() => ({
    // Translation system
    lang,
    t,
    setLang,
    toggleLang,
    
    // Language metadata
    currentLanguage,
    availableLanguages: LANGUAGES,
    
    // Legacy compatibility
    locale: lang as SupportedLocale,
    currency,
    setLocale: setLang as (locale: SupportedLocale) => void,
    setCurrency,
  }), [lang, currency, currentLanguage, i18nT]); // i18nT change might trigger
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Hook to get translation function
 */
export function useTranslation() {
  const { t, lang } = useLanguage();
  return { t, lang };
}

/**
 * Hook to get price formatter (uses current currency from context)
 */
export function useFormatPrice() {
  const { currency, lang } = useLanguage();
  
  return (price: number): string => {
    const locale = lang === 'bn' ? 'bn-BD' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
}
