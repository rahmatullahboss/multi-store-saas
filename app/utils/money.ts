/**
 * Money Utilities
 *
 * Best practices for handling money in JavaScript:
 * - Store money as integer cents internally (e.g., ৳100.50 = 10050 cents)
 * - Use these helpers for conversions and formatting
 * - Avoid floating-point arithmetic directly
 *
 * Current schema uses `real` (float) for legacy reasons.
 * NEW features should use integer cents where possible.
 */

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert display amount (e.g., 100.50) to cents (e.g., 10050)
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents (e.g., 10050) to display amount (e.g., 100.50)
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Safe rounding for display (avoids floating-point display issues)
 */
export function roundMoney(amount: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor) / factor;
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

interface FormatMoneyOptions {
  currency?: string;
  locale?: string;
  showSymbol?: boolean;
  decimals?: number;
}

/**
 * Format money for display
 * @example formatMoney(1500.5) => "৳1,500.50"
 * @example formatMoney(1500.5, { currency: 'USD' }) => "$1,500.50"
 */
export function formatMoney(
  amount: number,
  options: FormatMoneyOptions = {}
): string {
  const {
    currency = 'BDT',
    locale = 'en-BD',
    showSymbol = true,
    decimals = 2,
  } = options;

  const symbols: Record<string, string> = {
    BDT: '৳',
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
  };

  const rounded = roundMoney(amount, decimals);

  // Format with locale
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(rounded);

  if (showSymbol) {
    const symbol = symbols[currency] || currency;
    return `${symbol}${formatted}`;
  }

  return formatted;
}

/**
 * Format money from cents
 * @example formatMoneyFromCents(150050) => "৳1,500.50"
 */
export function formatMoneyFromCents(
  cents: number,
  options: FormatMoneyOptions = {}
): string {
  return formatMoney(fromCents(cents), options);
}

// ============================================================================
// CALCULATION FUNCTIONS (Safe arithmetic)
// ============================================================================

/**
 * Safe addition of money amounts
 * Converts to cents, adds, converts back
 */
export function addMoney(...amounts: number[]): number {
  const totalCents = amounts.reduce((sum, amt) => sum + toCents(amt), 0);
  return fromCents(totalCents);
}

/**
 * Safe subtraction of money amounts
 */
export function subtractMoney(from: number, ...amounts: number[]): number {
  const fromCentsVal = toCents(from);
  const subtractCents = amounts.reduce((sum, amt) => sum + toCents(amt), 0);
  return fromCents(fromCentsVal - subtractCents);
}

/**
 * Safe multiplication (e.g., price * quantity)
 */
export function multiplyMoney(amount: number, multiplier: number): number {
  const cents = toCents(amount);
  return fromCents(Math.round(cents * multiplier));
}

/**
 * Calculate percentage of money (e.g., tax, discount)
 * @example percentOfMoney(1000, 10) => 100 (10% of 1000)
 */
export function percentOfMoney(amount: number, percent: number): number {
  const cents = toCents(amount);
  const resultCents = Math.round((cents * percent) / 100);
  return fromCents(resultCents);
}

/**
 * Apply percentage discount
 * @example applyDiscount(1000, 10) => 900 (1000 - 10%)
 */
export function applyDiscount(amount: number, discountPercent: number): number {
  const discount = percentOfMoney(amount, discountPercent);
  return subtractMoney(amount, discount);
}

// ============================================================================
// COMPARISON FUNCTIONS (Avoid floating-point comparison issues)
// ============================================================================

/**
 * Compare two money amounts (avoids floating-point comparison issues)
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareMoney(a: number, b: number): -1 | 0 | 1 {
  const aCents = toCents(a);
  const bCents = toCents(b);
  if (aCents < bCents) return -1;
  if (aCents > bCents) return 1;
  return 0;
}

/**
 * Check if two money amounts are equal
 */
export function moneyEquals(a: number, b: number): boolean {
  return compareMoney(a, b) === 0;
}

/**
 * Check if amount meets minimum threshold
 */
export function meetsMinimum(amount: number, minimum: number): boolean {
  return compareMoney(amount, minimum) >= 0;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if value is a valid money amount
 */
export function isValidMoney(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    !isNaN(value) &&
    isFinite(value) &&
    value >= 0
  );
}

/**
 * Parse money from string input (e.g., user input)
 * Returns null if invalid
 */
export function parseMoney(input: string): number | null {
  // Remove currency symbols and whitespace
  const cleaned = input.replace(/[৳$€£₹,\s]/g, '').trim();

  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }

  return roundMoney(parsed);
}

// ============================================================================
// ORDER CALCULATION HELPERS
// ============================================================================

interface OrderCalculation {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

/**
 * Calculate order totals safely
 */
export function calculateOrderTotals(params: {
  items: { price: number; quantity: number }[];
  discountPercent?: number;
  discountFixed?: number;
  shippingCost: number;
  taxPercent?: number;
}): OrderCalculation {
  const {
    items,
    discountPercent = 0,
    discountFixed = 0,
    shippingCost,
    taxPercent = 0,
  } = params;

  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) => addMoney(sum, multiplyMoney(item.price, item.quantity)),
    0
  );

  // Calculate discount
  let discount = 0;
  if (discountPercent > 0) {
    discount = percentOfMoney(subtotal, discountPercent);
  } else if (discountFixed > 0) {
    discount = discountFixed;
  }

  // Calculate tax on (subtotal - discount)
  const taxableAmount = subtractMoney(subtotal, discount);
  const tax = percentOfMoney(taxableAmount, taxPercent);

  // Calculate total
  const total = addMoney(
    subtractMoney(subtotal, discount),
    shippingCost,
    tax
  );

  return {
    subtotal: roundMoney(subtotal),
    discount: roundMoney(discount),
    shipping: roundMoney(shippingCost),
    tax: roundMoney(tax),
    total: roundMoney(total),
  };
}
