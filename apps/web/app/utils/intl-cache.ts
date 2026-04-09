/**
 * Caches Intl.NumberFormat instances to prevent the massive performance bottleneck
 * of repeatedly instantiating new formatters, especially inside render loops.
 */
const formatterCache = new Map<string, Intl.NumberFormat>();

export function getFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}-${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}
