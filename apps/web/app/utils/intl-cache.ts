/**
 * Cached Intl formatters to prevent performance bottlenecks during rendering.
 * Instantiating Intl.NumberFormat and Intl.DateTimeFormat is expensive and can block the main thread
 * when formatting many prices/numbers in a list or table.
 */

export function getCachedNumberFormat(locale: string, options: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  const globalAny = globalThis as any;
  globalAny.__intlNumberFormatCache = globalAny.__intlNumberFormatCache || new Map<string, Intl.NumberFormat>();
  const cache: Map<string, Intl.NumberFormat> = globalAny.__intlNumberFormatCache;

  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter;
}

export function getCachedDateTimeFormat(locale: string, options: Intl.DateTimeFormatOptions = {}): Intl.DateTimeFormat {
  const globalAny = globalThis as any;
  globalAny.__intlDateTimeFormatCache = globalAny.__intlDateTimeFormatCache || new Map<string, Intl.DateTimeFormat>();
  const cache: Map<string, Intl.DateTimeFormat> = globalAny.__intlDateTimeFormatCache;

  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter;
}
