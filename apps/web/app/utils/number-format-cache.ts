/**
 * Centralized caching utility for Intl.NumberFormat instances.
 *
 * Instantiating `Intl.NumberFormat` is an expensive operation in JavaScript.
 * By caching these instances, we can significantly reduce the performance overhead,
 * especially in scenarios where formatting is called frequently (e.g., rendering lists of products).
 */

const numberFormatCache = new Map<string, Intl.NumberFormat>();

/**
 * Gets a cached instance of `Intl.NumberFormat` or creates one if it doesn't exist.
 *
 * @param locale A string with a BCP 47 language tag, or an array of such strings.
 * @param options An object with configuration properties.
 * @returns An instance of `Intl.NumberFormat`.
 */
export function getCachedNumberFormat(
  locale: string | string[],
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const cacheKey = JSON.stringify({ locale, options });

  let formatter = numberFormatCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(cacheKey, formatter);
  }

  return formatter;
}
