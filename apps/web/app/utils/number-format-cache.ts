/**
 * Utility for caching Intl.NumberFormat instances.
 * Re-instantiating Intl.NumberFormat is a significant JavaScript performance bottleneck.
 */

const numberFormatCache = new Map<string, Intl.NumberFormat>();

export function getCachedNumberFormat(
  locale: string,
  options: Intl.NumberFormatOptions = {}
): Intl.NumberFormat {
  // Using JSON.stringify for options ensures a deterministic cache key for flat scalar properties
  const key = `${locale}-${JSON.stringify(options)}`;

  let formatter = numberFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
  }

  return formatter;
}
