/**
 * Centralized Price Formatting Utility
 *
 * Features:
 * - Supports multiple locales (en-US, bn-BD)
 * - Forces Latin numerals using numberingSystem: 'latn'
 * - Configurable currency symbol placement
 */

export type SupportedLocale = 'en' | 'bn';
export type SupportedCurrency = 'USD' | 'BDT' | 'EUR' | 'GBP';

interface FormatPriceOptions {
  locale?: SupportedLocale;
  currency?: SupportedCurrency;
  showSymbol?: boolean;
}

// Currency configurations
const CURRENCY_CONFIG: Record<SupportedCurrency, { symbol: string; code: string }> = {
  USD: { symbol: '$', code: 'USD' },
  BDT: { symbol: '৳', code: 'BDT' },
  EUR: { symbol: '€', code: 'EUR' },
  GBP: { symbol: '£', code: 'GBP' },
};

// Locale to Intl locale mapping - always use 'latn' numbering system for Latin digits
const LOCALE_MAP: Record<SupportedLocale, string> = {
  en: 'en-US',
  bn: 'bn-BD-u-nu-latn', // Bengali locale with Latin numerals
};

/**
 * Format a price with the specified locale and currency
 * Always displays Latin numerals (0-9) regardless of locale
 */
export function formatPrice(price: number, options: FormatPriceOptions = {}): string {
  const { locale = 'bn', currency = 'BDT', showSymbol = true } = options;

  const intlLocale = LOCALE_MAP[locale];
  const isBDT = currency === 'BDT';
  const priceInUnits = price / 100;

  try {
    if (showSymbol && isBDT) {
      // For BDT, use simple ৳ symbol instead of "BDT" text from Intl
      return `৳${priceInUnits.toLocaleString('bn-BD')}`;
    }

    const formatted = new Intl.NumberFormat(intlLocale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: isBDT ? 0 : 2,
      // Force Latin numerals
      numberingSystem: 'latn',
    }).format(priceInUnits);

    return formatted;
  } catch {
    // Fallback for unsupported currencies
    const currencyInfo = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
    return showSymbol
      ? `${currencyInfo.symbol}${priceInUnits.toFixed(2)}`
      : priceInUnits.toFixed(2);
  }
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  return CURRENCY_CONFIG[currency]?.symbol || '$';
}

/**
 * Format price with simple output (for backward compatibility)
 * Uses English locale with Latin numerals by default
 */
export function formatPriceSimple(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}
