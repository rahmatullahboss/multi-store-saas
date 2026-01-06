/**
 * Language & Currency Context
 * 
 * Provides global language and currency state across the app
 * Language persists in localStorage and syncs with URL ?lang= param
 */

import { createContext, useContext, useMemo, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from '@remix-run/react';
import { translations, LANGUAGES, LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE, type Language, type TranslationKey, type LanguageConfig } from '~/utils/i18n';
import type { SupportedLocale, SupportedCurrency } from '~/utils/formatPrice';

interface LanguageContextValue {
  // Translation system
  lang: Language;
  t: (key: TranslationKey) => string;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  
  // Language metadata
  currentLanguage: LanguageConfig | undefined;
  availableLanguages: LanguageConfig[];
  
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

/**
 * Get initial language from localStorage (client-side only)
 */
function getStoredLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && (stored === 'en' || stored === 'bn')) {
      return stored as Language;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

export function LanguageProvider({ 
  children, 
  defaultLang = DEFAULT_LANGUAGE,
  defaultCurrency = 'BDT'
}: LanguageProviderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Get language from URL or localStorage or default
  const urlLang = searchParams.get('lang') as Language | null;
  const [storedLang, setStoredLang] = useState<Language | null>(null);
  
  // Hydration effect - get stored language on client
  useEffect(() => {
    setStoredLang(getStoredLanguage());
    setIsHydrated(true);
  }, []);
  
  // Priority: URL param > localStorage > default
  const lang: Language = urlLang && (urlLang === 'en' || urlLang === 'bn') 
    ? urlLang 
    : (storedLang || defaultLang);
  
  const currency = (searchParams.get('currency') as SupportedCurrency) || defaultCurrency;
  
  const setLang = (newLang: Language) => {
    // Save to localStorage
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch {
      // localStorage not available
    }
    
    // Update URL
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
  }), [lang, t, currency, currentLanguage]);
  
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

