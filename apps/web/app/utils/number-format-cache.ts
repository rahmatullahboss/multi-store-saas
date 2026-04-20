const numberFormatCache = new Map<string, Intl.NumberFormat>();

export function getCachedNumberFormat(
  locales: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const key = JSON.stringify({ locales, options });
  let formatter = numberFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locales, options);
    numberFormatCache.set(key, formatter);
  }
  return formatter;
}
