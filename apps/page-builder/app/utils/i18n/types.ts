/**
 * i18n Types and Constants
 */

export type Language = 'en' | 'bn';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', direction: 'ltr' },
];

export const DEFAULT_LANGUAGE: Language = 'bn';

export const LANGUAGE_STORAGE_KEY = 'preferred-language';
