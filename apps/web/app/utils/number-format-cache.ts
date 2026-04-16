/**
 * Centralized module-level cache for Intl.NumberFormat instances
 *
 * Re-instantiating Intl.NumberFormat is a known performance bottleneck in JavaScript.
 * This utility caches and reuses instances based on their locale and options.
 */

const formatterCache = new Map<string, Intl.NumberFormat>();

export function getCachedNumberFormat(
  locales?: string | string[],
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  // Create a predictable cache key
  const cacheKey = JSON.stringify({ locales, options });

  let formatter = formatterCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locales, options);
    formatterCache.set(cacheKey, formatter);
  }

  return formatter;
}
