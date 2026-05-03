/**
 * Centralized caching utility for Intl.NumberFormat instances.
 * Instantiating Intl.NumberFormat is computationally expensive.
 * Caching instances based on locale and options dramatically improves
 * performance, especially in loops or high-frequency render paths.
 */

const numberFormatCache = new Map<string, Intl.NumberFormat>();

export function getCachedNumberFormat(
  locale: string | string[] | undefined,
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  // Generate a deterministic cache key.
  // Using JSON.stringify on options is safe here since Intl options are flat scalars.
  const localeKey = Array.isArray(locale) ? locale.join(',') : String(locale);
  const cacheKey = `${localeKey}-${options ? JSON.stringify(options) : ''}`;

  let formatter = numberFormatCache.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(cacheKey, formatter);
  }

  return formatter;
}
