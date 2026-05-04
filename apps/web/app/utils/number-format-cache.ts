const numberFormatCache = new Map<string, Intl.NumberFormat>();

export function getCachedNumberFormat(
  locales?: string | string[],
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const cacheKey = JSON.stringify({ locales, options });

  if (!numberFormatCache.has(cacheKey)) {
    numberFormatCache.set(cacheKey, new Intl.NumberFormat(locales, options));
  }

  return numberFormatCache.get(cacheKey) as Intl.NumberFormat;
}
