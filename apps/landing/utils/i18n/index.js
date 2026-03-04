import { en } from './en';
import { bn } from './bn';
import { LANGUAGES, DEFAULT_LANGUAGE } from './types';
export const translations = {
    en,
    bn,
};
/**
 * Get translation for a key
 */
export function t(key, lang = 'en', params) {
    const dict = translations[lang];
    const enDict = translations.en;
    let text = dict[key] || enDict[key] || key;
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            // Support both {{key}} and {key}
            const regex = new RegExp(`{{?${k}}}?`, 'g');
            text = text.replace(regex, String(v));
        });
    }
    return text;
}
/**
 * Create a translator function for a specific language
 */
export function createTranslator(lang) {
    return (key) => t(key, lang);
}
/**
 * Get language config by code
 */
export function getLanguageConfig(code) {
    return LANGUAGES.find((lang) => lang.code === code);
}
/**
 * Check if a language code is valid
 */
export function isValidLanguage(code) {
    return LANGUAGES.some((lang) => lang.code === code);
}
/**
 * Get language from URL search params
 */
export function getLanguageFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const lang = urlObj.searchParams.get('lang');
        if (lang && isValidLanguage(lang)) {
            return lang;
        }
        return DEFAULT_LANGUAGE;
    }
    catch {
        return DEFAULT_LANGUAGE;
    }
}
/**
 * Add language param to URL
 */
export function addLanguageToUrl(url, lang) {
    try {
        const urlObj = new URL(url, 'http://localhost');
        urlObj.searchParams.set('lang', lang);
        return urlObj.pathname + urlObj.search;
    }
    catch {
        return `${url}${url.includes('?') ? '&' : '?'}lang=${lang}`;
    }
}
/**
 * Storage key for language preference
 */
export const LANGUAGE_STORAGE_KEY = 'preferred-language';
export * from './types';
