/**
 * Centralized caching for Intl.NumberFormat and Intl.DateTimeFormat
 * Instantiating formatters is a significant performance bottleneck.
 * This module provides a shared cache to avoid recreating them on every render.
 */

const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();

export function getCachedNumberFormat(
  locale: string,
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const cacheKey = `${locale}-${options ? JSON.stringify(options) : ''}`;

  if (!numberFormatCache.has(cacheKey)) {
    numberFormatCache.set(cacheKey, new Intl.NumberFormat(locale, options));
  }

  return numberFormatCache.get(cacheKey)!;
}

export function getCachedDateTimeFormat(
  locale: string,
  options?: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const cacheKey = `${locale}-${options ? JSON.stringify(options) : ''}`;

  if (!dateTimeFormatCache.has(cacheKey)) {
    dateTimeFormatCache.set(cacheKey, new Intl.DateTimeFormat(locale, options));
  }

  return dateTimeFormatCache.get(cacheKey)!;
}
