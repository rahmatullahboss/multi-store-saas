/**
 * Cache for Intl.NumberFormat instances
 * Instantiating Intl.NumberFormat is expensive and can be a performance bottleneck
 * when done inside render paths or mapping loops.
 */

const formatterCache = new Map<string, Intl.NumberFormat>();

export function getCachedNumberFormat(locale: string, options: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  const cacheKey = `${locale}-${JSON.stringify(options)}`;

  if (!formatterCache.has(cacheKey)) {
    formatterCache.set(cacheKey, new Intl.NumberFormat(locale, options));
  }

  return formatterCache.get(cacheKey)!;
}
