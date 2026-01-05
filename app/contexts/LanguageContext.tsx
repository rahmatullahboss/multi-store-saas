/**
 * Language & Currency Context
 * 
 * Manages user's language and currency preferences
 * Persists to localStorage for consistency across sessions
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SupportedLocale, SupportedCurrency } from '~/utils/formatPrice';

interface LanguageContextType {
  locale: SupportedLocale;
  currency: SupportedCurrency;
  setLocale: (locale: SupportedLocale) => void;
  setCurrency: (currency: SupportedCurrency) => void;
  // Convenience helpers
  isEnglish: boolean;
  isBengali: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY_LOCALE = 'store_locale';
const STORAGE_KEY_CURRENCY = 'store_currency';

interface LanguageProviderProps {
  children: ReactNode;
  defaultLocale?: SupportedLocale;
  defaultCurrency?: SupportedCurrency;
}

export function LanguageProvider({ 
  children, 
  defaultLocale = 'en',
  defaultCurrency = 'USD' 
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(defaultLocale);
  const [currency, setCurrencyState] = useState<SupportedCurrency>(defaultCurrency);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLocale = localStorage.getItem(STORAGE_KEY_LOCALE) as SupportedLocale;
      const storedCurrency = localStorage.getItem(STORAGE_KEY_CURRENCY) as SupportedCurrency;
      
      if (storedLocale && ['en', 'bn'].includes(storedLocale)) {
        setLocaleState(storedLocale);
      }
      if (storedCurrency && ['USD', 'BDT', 'EUR', 'GBP'].includes(storedCurrency)) {
        setCurrencyState(storedCurrency);
      }
      setIsHydrated(true);
    }
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_LOCALE, newLocale);
    }
  };

  const setCurrency = (newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CURRENCY, newCurrency);
    }
  };

  const value: LanguageContextType = {
    locale,
    currency,
    setLocale,
    setCurrency,
    isEnglish: locale === 'en',
    isBengali: locale === 'bn',
  };

  // Prevent hydration mismatch by using default values until client hydrates
  if (!isHydrated) {
    return (
      <LanguageContext.Provider value={{
        locale: defaultLocale,
        currency: defaultCurrency,
        setLocale: () => {},
        setCurrency: () => {},
        isEnglish: defaultLocale === 'en',
        isBengali: defaultLocale === 'bn',
      }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for formatting prices with current locale/currency
export function useFormatPrice() {
  const { locale, currency } = useLanguage();
  
  return (price: number) => {
    return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD-u-nu-latn' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      numberingSystem: 'latn',
    }).format(price);
  };
}

// Hook for getting translations based on current locale
export function useTranslation() {
  const { locale } = useLanguage();
  
  // Dynamic import to avoid SSR issues
  const { getTranslations } = require('~/utils/translations');
  return getTranslations(locale);
}
