/**
 * Language Context for Page Builder Worker
 * 
 * Provides translation support using the migrated i18n utilities.
 */

import { createContext, useContext, useMemo, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useSearchParams } from '@remix-run/react';
import { 
  LANGUAGES, 
  DEFAULT_LANGUAGE, 
  type Language, 
  type TranslationKey, 
  type LanguageConfig, 
  t as i18nCustomT,
  isValidLanguage
} from '~/utils/i18n/index';

interface LanguageContextValue {
  lang: Language;
  t: (key: string | TranslationKey, options?: Record<string, string | number>) => string;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  currentLanguage: LanguageConfig | undefined;
  availableLanguages: LanguageConfig[];
}

// Default fallback for SSR or when outside provider
const defaultContextValue: LanguageContextValue = {
  lang: DEFAULT_LANGUAGE,
  t: (key: string | TranslationKey, options?: Record<string, string | number>) => 
    i18nCustomT(key as TranslationKey, DEFAULT_LANGUAGE, options),
  setLang: () => {},
  toggleLang: () => {},
  currentLanguage: LANGUAGES.find(l => l.code === DEFAULT_LANGUAGE),
  availableLanguages: LANGUAGES,
};

const LanguageContext = createContext<LanguageContextValue>(defaultContextValue);

export function LanguageProvider({ 
  children, 
  defaultLang = DEFAULT_LANGUAGE 
}: { 
  children: ReactNode; 
  defaultLang?: Language;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get language from URL or fallback to default
  const urlLang = searchParams.get('lang');
  const [lang, setLangState] = useState<Language>(
    urlLang && isValidLanguage(urlLang) ? (urlLang as Language) : defaultLang
  );

  // Sync state if URL changes
  useEffect(() => {
    if (urlLang && isValidLanguage(urlLang) && urlLang !== lang) {
      setLangState(urlLang as Language);
    }
  }, [urlLang, lang]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('lang', newLang);
    setSearchParams(newParams, { preventScrollReset: true });
  }, [searchParams, setSearchParams]);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'bn' : 'en');
  }, [lang, setLang]);

  const t = useCallback((key: string | TranslationKey, options?: Record<string, string | number>) => {
    return i18nCustomT(key as TranslationKey, lang, options);
  }, [lang]);

  const currentLanguage = useMemo(() => {
    return LANGUAGES.find(l => l.code === lang);
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    t,
    setLang,
    toggleLang,
    currentLanguage,
    availableLanguages: LANGUAGES,
  }), [lang, currentLanguage, setLang, toggleLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export function useTranslation() {
  const { t, lang } = useLanguage();
  return { t, lang };
}
