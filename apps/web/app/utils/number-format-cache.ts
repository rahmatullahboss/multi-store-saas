/**
 * Module-level cache for Intl.NumberFormat instances.
 * Instantiating Intl formatters is an expensive operation. This utility caches
 * formatters based on their locale and options to improve performance,
 * especially in loops or frequently rendered components.
 */

const formattersCache = new Map<string, Intl.NumberFormat>();

export function getCachedNumberFormat(
  locale: string | string[] | undefined,
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const cacheKey = JSON.stringify({ locale, options });
  let formatter = formattersCache.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formattersCache.set(cacheKey, formatter);
  }

  return formatter;
}
