export const getCachedNumberFormat = (() => {
  const cache = new Map<string, Intl.NumberFormat>();

  return (locale: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat => {
    const key = `${locale}-${options ? JSON.stringify(options) : ''}`;

    if (!cache.has(key)) {
      cache.set(key, new Intl.NumberFormat(locale, options));
    }

    return cache.get(key)!;
  };
})();
