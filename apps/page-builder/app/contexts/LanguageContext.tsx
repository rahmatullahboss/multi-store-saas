/**
 * Language Context for Page Builder Worker
 * 
 * Provides translation support using the migrated i18n utilities.
 */

import { createContext, useContext, useMemo, useEffect, useState, type ReactNode } from 'react';
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
  t: (key: string | TranslationKey, options?: any) => string;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  currentLanguage: LanguageConfig | undefined;
  availableLanguages: LanguageConfig[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

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

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('lang', newLang);
    setSearchParams(newParams, { preventScrollReset: true });
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'bn' : 'en');
  };

  const t = (key: string | TranslationKey, options?: any) => {
    return i18nCustomT(key as TranslationKey, lang, options);
  };

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
  }), [lang, currentLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, lang } = useLanguage();
  return { t, lang };
}
