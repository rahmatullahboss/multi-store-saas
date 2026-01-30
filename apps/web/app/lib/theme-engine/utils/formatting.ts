/**
 * Formatting Utilities for Theme Engine
 *
 * Common formatting functions for prices, dates, and other display values.
 */

/**
 * Format a price for display
 *
 * @param price - Price in cents/poisha (e.g., 149900 for ৳1499.00)
 * @param currency - Currency code (default: 'BDT')
 * @returns Formatted price string
 *
 * @example
 * formatPrice(149900) // "৳1,499"
 * formatPrice(149900, 'USD') // "$14.99"
 * formatPrice(undefined) // "৳0"
 */
export function formatPrice(price: number | undefined | null, currency: string = 'BDT'): string {
  const safePrice = price ?? 0;

  if (currency === 'BDT') {
    return `৳${(safePrice / 100).toLocaleString('bn-BD')}`;
  }

  return `$${(safePrice / 100).toFixed(2)}`;
}

/**
 * Format a price with locale
 *
 * @param price - Price in cents
 * @param currency - Currency code
 * @param locale - Locale string (default: 'bn-BD' for BDT, 'en-US' for others)
 * @returns Formatted price string with locale
 */
export function formatPriceWithLocale(
  price: number | undefined | null,
  currency: string = 'BDT',
  locale?: string
): string {
  const safePrice = price ?? 0;
  const finalLocale = locale ?? (currency === 'BDT' ? 'bn-BD' : 'en-US');
  const symbol = currency === 'BDT' ? '৳' : '$';

  return `${symbol}${(safePrice / 100).toLocaleString(finalLocale)}`;
}

/**
 * Calculate discount percentage
 *
 * @param price - Current price
 * @param compareAtPrice - Original/compare price
 * @returns Discount percentage (0-100) or 0 if no discount
 */
export function calculateDiscountPercentage(
  price: number | undefined | null,
  compareAtPrice: number | undefined | null
): number {
  if (!price || !compareAtPrice || compareAtPrice <= 0) {
    return 0;
  }

  return Math.round((1 - price / compareAtPrice) * 100);
}

/**
 * Format a number with locale
 *
 * @param value - Number to format
 * @param locale - Locale string (default: 'bn-BD')
 * @returns Formatted number string
 */
export function formatNumber(value: number | undefined | null, locale: string = 'bn-BD'): string {
  const safeValue = value ?? 0;
  return safeValue.toLocaleString(locale);
}
