export const numberFormatCache = new Map<string, Intl.NumberFormat>();

export function getCachedNumberFormat(
  locale: string | string[],
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const key = `${Array.isArray(locale) ? locale.join(',') : locale}-${options ? JSON.stringify(options) : ''}`;
  let formatter = numberFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
  }
  return formatter;
}
