/**
 * Centralized cache for Intl.NumberFormat instances.
 * Instantiating Intl objects is expensive, so we cache and reuse them.
 */

const numberFormatCache = new Map<string, Intl.NumberFormat>();

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
