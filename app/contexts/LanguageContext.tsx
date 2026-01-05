/**
 * Language & Currency Context
 * 
 * Provides global language and currency state across the app
 * Language is read from URL ?lang= param, currency from ?currency=
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useSearchParams } from '@remix-run/react';
import { translations, type Language, type TranslationKey } from '~/utils/i18n';
import type { SupportedLocale, SupportedCurrency } from '~/utils/formatPrice';

interface LanguageContextValue {
  // Translation system
  lang: Language;
  t: (key: TranslationKey) => string;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  
  // Legacy compatibility (for existing LanguageToggle)
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
  defaultLang = 'en',
  defaultCurrency = 'BDT'
}: LanguageProviderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const lang = (searchParams.get('lang') as Language) || defaultLang;
  const currency = (searchParams.get('currency') as SupportedCurrency) || defaultCurrency;
  
  const setLang = (newLang: Language) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('lang', newLang);
    setSearchParams(newParams, { preventScrollReset: true });
  };
  
  const setCurrency = (newCurrency: SupportedCurrency) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('currency', newCurrency);
    setSearchParams(newParams, { preventScrollReset: true });
  };
  
  const toggleLang = () => {
    setLang(lang === 'en' ? 'bn' : 'en');
  };
  
  const t = useMemo(() => {
    return (key: TranslationKey): string => {
      return translations[lang][key] || translations.en[key] || key;
    };
  }, [lang]);
  
  const value = useMemo(() => ({
    // Translation system
    lang,
    t,
    setLang,
    toggleLang,
    
    // Legacy compatibility
    locale: lang as SupportedLocale,
    currency,
    setLocale: setLang as (locale: SupportedLocale) => void,
    setCurrency,
  }), [lang, t, currency]);
  
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
  const { t } = useLanguage();
  return t;
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
