'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { t as translate, Language } from '@/utils/i18n';

interface LanguageContextType {
  t: (key: string, options?: any) => string;
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  t: (key: string) => key,
  lang: 'en',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('bn');

  const t = (key: string, options?: any) => translate(key as any, lang, options);

  return (
    <LanguageContext.Provider value={{ t, lang, setLang }}>{children}</LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

// Helper hook for price formatting
export function useFormatPrice() {
  const { lang } = useTranslation();

  return (amount: number, currency: string = 'BDT') => {
    if (lang === 'bn') {
      return `৳${amount.toLocaleString('bn-BD')}`;
    }
    return `${currency} ${amount.toLocaleString('en-US')}`;
  };
}
