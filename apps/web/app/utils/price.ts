/**
 * Calculate discount percentage from price and compareAtPrice
 */
export function calculateDiscountPercentage(price: number, compareAtPrice: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/**
 * Format currency (simple fallback if context not used)
 */
export function formatCurrency(amount: number, currency = 'BDT'): string {
  const isBDT = currency === 'BDT';
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: isBDT ? 0 : 2,
    maximumFractionDigits: isBDT ? 0 : 2,
  }).format(amount);
}

export function parsePriceRange(min?: string | null, max?: string | null) {
  const parsedMin = min ? Number(min) : null;
  const parsedMax = max ? Number(max) : null;

  return {
    minPrice: Number.isFinite(parsedMin) && parsedMin! >= 0 ? parsedMin : null,
    maxPrice: Number.isFinite(parsedMax) && parsedMax! >= 0 ? parsedMax : null,
  };
}
