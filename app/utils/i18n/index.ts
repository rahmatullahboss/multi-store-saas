import { en } from './en';
import { bn } from './bn';
import { LANGUAGES, DEFAULT_LANGUAGE, Language, LanguageConfig } from './types';

export const translations = {
  en,
  bn,
} as const;

export type TranslationKey = keyof typeof translations.en;

/**
 * Get translation for a key
 */
export function t(key: TranslationKey, lang: Language = 'en'): string {
  const dict = translations[lang] as Record<string, string>;
  const enDict = translations.en as Record<string, string>;
  return dict[key] || enDict[key] || key;
}

/**
 * Create a translator function for a specific language
 */
export function createTranslator(lang: Language) {
  return (key: TranslationKey): string => t(key, lang);
}

/**
 * Get language config by code
 */
export function getLanguageConfig(code: Language): LanguageConfig | undefined {
  return LANGUAGES.find((lang) => lang.code === code);
}

/**
 * Check if a language code is valid
 */
export function isValidLanguage(code: string): code is Language {
  return LANGUAGES.some((lang) => lang.code === code);
}

/**
 * Get language from URL search params
 */
export function getLanguageFromUrl(url: string): Language {
  try {
    const urlObj = new URL(url);
    const lang = urlObj.searchParams.get('lang');
    if (lang && isValidLanguage(lang)) {
      return lang as Language;
    }
    return DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

/**
 * Add language param to URL
 */
export function addLanguageToUrl(url: string, lang: Language): string {
  try {
    const urlObj = new URL(url, 'http://localhost');
    urlObj.searchParams.set('lang', lang);
    return urlObj.pathname + urlObj.search;
  } catch {
    return `${url}${url.includes('?') ? '&' : '?'}lang=${lang}`;
  }
}

/**
 * Storage key for language preference
 */
export const LANGUAGE_STORAGE_KEY = 'preferred-language';

export * from './types';
