// Cache for Intl.NumberFormat instances to improve performance
const numberFormatCache = new Map<string, Intl.NumberFormat>();

export function getCachedNumberFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const cacheKey = `${locale}-${JSON.stringify(options)}`;
  let formatter = numberFormatCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(cacheKey, formatter);
  }
  return formatter;
}
