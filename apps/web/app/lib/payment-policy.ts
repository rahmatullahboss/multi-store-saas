export type CheckoutPaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'stripe' | 'sslcommerz';

export type NormalizedPlanType = 'free' | 'starter' | 'premium' | 'business';

const FREE_METHODS: CheckoutPaymentMethod[] = ['cod', 'bkash', 'nagad'];
const PAID_METHODS: CheckoutPaymentMethod[] = [
  'cod',
  'bkash',
  'nagad',
  'rocket',
  'stripe',
  'sslcommerz',
];

export function normalizePlanType(planType: string | null | undefined): NormalizedPlanType {
  const normalized = (planType || 'free').toLowerCase();
  if (normalized === 'starter') return 'starter';
  if (normalized === 'premium') return 'premium';
  if (normalized === 'business' || normalized === 'custom') return 'business';
  return 'free';
}

export function getAllowedCheckoutPaymentMethods(
  planType: string | null | undefined
): CheckoutPaymentMethod[] {
  const normalized = normalizePlanType(planType);
  return normalized === 'free' ? FREE_METHODS : PAID_METHODS;
}

export function isPaymentMethodAllowedForPlan(
  planType: string | null | undefined,
  method: string | null | undefined
): method is CheckoutPaymentMethod {
  if (!method) return false;
  return getAllowedCheckoutPaymentMethods(planType).includes(method as CheckoutPaymentMethod);
}

export function getDefaultPaymentMethodForPlan(
  _planType: string | null | undefined
): CheckoutPaymentMethod {
  return 'cod';
}

export function canUseAdvancedManualPayments(_planType: string | null | undefined): boolean {
  // Free plan now supports COD + bKash + Nagad.
  // Rocket and full gateway integrations remain paid-only.
  return normalizePlanType(_planType) !== 'free';
}

export function calculatePlatformFee(
  total: number,
  feeRate: number
): {
  platformFeeAmount: number;
  merchantNetAmount: number;
} {
  const safeTotal = Number.isFinite(total) ? Math.max(0, total) : 0;
  const safeRate = Number.isFinite(feeRate) ? Math.min(Math.max(feeRate, 0), 1) : 0;
  const platformFeeAmount = Math.round(safeTotal * safeRate * 100) / 100;
  const merchantNetAmount = Math.round((safeTotal - platformFeeAmount) * 100) / 100;
  return {
    platformFeeAmount,
    merchantNetAmount,
  };
}
