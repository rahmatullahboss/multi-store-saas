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
  // DEPRECATED: Prices now stored in taka directly, not cents
  // Keeping function for backward compatibility
  return amount;
  // return Math.round(amount * 100);  // Old: converted to cents
}

/**
 * Convert cents (e.g., 10050) to display amount (e.g., 100.50)
 */
export function fromCents(cents: number): number {
  // DEPRECATED: Prices now stored in taka directly, not cents
  // Keeping function for backward compatibility
  return cents;
  // return cents / 100;  // Old: converted from cents
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

// ============================================================================
// MULTI-CURRENCY CONFIGURATION
// ============================================================================

/**
 * Currency configuration for multi-currency support
 * subunits: How many smallest units in 1 main unit (e.g., 100 paisa = 1 taka)
 */
export const CURRENCY_CONFIG: Record<string, {
  symbol: string;
  code: string;
  subunits: number; // 100 for most currencies
  locale: string;
  decimals: number;
  name: string;
  nameBn?: string;
}> = {
  BDT: {
    symbol: '৳',
    code: 'BDT',
    subunits: 100, // 100 paisa = 1 taka
    locale: 'bn-BD',
    decimals: 0, // BDT typically shown without decimals
    name: 'Bangladeshi Taka',
    nameBn: 'বাংলাদেশি টাকা',
  },
  USD: {
    symbol: '$',
    code: 'USD',
    subunits: 100, // 100 cents = 1 dollar
    locale: 'en-US',
    decimals: 2,
    name: 'US Dollar',
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    subunits: 100,
    locale: 'de-DE',
    decimals: 2,
    name: 'Euro',
  },
  GBP: {
    symbol: '£',
    code: 'GBP',
    subunits: 100,
    locale: 'en-GB',
    decimals: 2,
    name: 'British Pound',
  },
  INR: {
    symbol: '₹',
    code: 'INR',
    subunits: 100, // 100 paise = 1 rupee
    locale: 'en-IN',
    decimals: 0, // INR typically shown without decimals
    name: 'Indian Rupee',
  },
};

/**
 * Get currency config with fallback to BDT
 */
export function getCurrencyConfig(currencyCode: string = 'BDT') {
  return CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.BDT;
}

/**
 * Format money with currency-aware settings
 * Automatically uses correct locale, decimals, and symbol for the currency
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'BDT',
  options: { fromCents?: boolean } = {}
  // DEPRECATED: fromCents option no longer needed, prices stored as taka
): string {
  const config = getCurrencyConfig(currencyCode);
  const displayAmount = amount; // Always use amount directly, no cents conversion
  
  return formatMoney(displayAmount, {
    currency: currencyCode,
    locale: config.locale,
    decimals: config.decimals,
    showSymbol: true,
  });
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
  const total = amounts.reduce((sum, amt) => sum + amt, 0);
  return roundMoney(total);
}

/**
 * Safe subtraction of money amounts
 */
export function subtractMoney(from: number, ...amounts: number[]): number {
  const fromVal = from;
  const subtractTotal = amounts.reduce((sum, amt) => sum + amt, 0);
  return roundMoney(fromVal - subtractTotal);
}

/**
 * Safe multiplication (e.g., price * quantity)
 */
export function multiplyMoney(amount: number, multiplier: number): number {
  // Direct multiplication, no cents conversion
  return roundMoney(amount * multiplier);
}

/**
 * Calculate percentage of money (e.g., tax, discount)
 * @example percentOfMoney(1000, 10) => 100 (10% of 1000)
 */
export function percentOfMoney(amount: number, percent: number): number {
  // Direct multiplication, no cents conversion
  const result = Math.round((amount * percent) / 100);
  return result;
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
  const aRounded = Math.round(a * 100);
  const bRounded = Math.round(b * 100);
  if (aRounded < bRounded) return -1;
  if (aRounded > bRounded) return 1;
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
