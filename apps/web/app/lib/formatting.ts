function normalizeCurrency(currency: string | undefined | null): string {
  if (!currency) return 'BDT';

  if (currency === '৳' || currency === 'TK' || currency === 'Tk') {
    return 'BDT';
  }
  if (currency === '$') {
    return 'USD';
  }

  const upperCurrency = currency.toUpperCase();
  if (upperCurrency === 'BDT' || upperCurrency === 'USD') {
    return upperCurrency;
  }

  return 'BDT';
}

export function formatPrice(
  price: number | undefined | null,
  currency: string | undefined | null = 'BDT'
): string {
  const safePrice = price ?? 0;
  const normalizedCurrency = normalizeCurrency(currency);

  if (normalizedCurrency === 'BDT') {
    return `৳${safePrice.toLocaleString('bn-BD')}`;
  }

  return `$${safePrice.toFixed(2)}`;
}

export function formatPriceWithLocale(
  price: number | undefined | null,
  currency: string = 'BDT',
  locale?: string
): string {
  const safePrice = price ?? 0;
  const finalLocale = locale ?? (currency === 'BDT' ? 'bn-BD' : 'en-US');
  const symbol = currency === 'BDT' ? '৳' : '$';

  return `${symbol}${safePrice.toLocaleString(finalLocale)}`;
}
