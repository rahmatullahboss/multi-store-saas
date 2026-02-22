import { describe, expect, it } from 'vitest';
import {
  calculatePlatformFee,
  canUseAdvancedManualPayments,
  getAllowedCheckoutPaymentMethods,
  isPaymentMethodAllowedForPlan,
  normalizePlanType,
} from '~/lib/payment-policy';

describe('payment policy', () => {
  it('normalizes plan types with legacy custom alias', () => {
    expect(normalizePlanType('custom')).toBe('business');
    expect(normalizePlanType('PREMIUM')).toBe('premium');
    expect(normalizePlanType('unknown')).toBe('free');
  });

  it('allows cod + bkash + nagad for free plan', () => {
    expect(getAllowedCheckoutPaymentMethods('free')).toEqual(['cod', 'bkash', 'nagad']);
    expect(isPaymentMethodAllowedForPlan('free', 'cod')).toBe(true);
    expect(isPaymentMethodAllowedForPlan('free', 'bkash')).toBe(true);
    expect(isPaymentMethodAllowedForPlan('free', 'nagad')).toBe(true);
    expect(canUseAdvancedManualPayments('free')).toBe(false);
  });

  it('allows advanced manual payments on paid plans', () => {
    expect(getAllowedCheckoutPaymentMethods('starter')).toContain('nagad');
    expect(getAllowedCheckoutPaymentMethods('premium')).toContain('rocket');
    expect(getAllowedCheckoutPaymentMethods('premium')).toContain('sslcommerz');
    expect(canUseAdvancedManualPayments('business')).toBe(true);
  });

  it('calculates platform fee safely', () => {
    expect(calculatePlatformFee(1000, 0.02)).toEqual({
      platformFeeAmount: 20,
      merchantNetAmount: 980,
    });
    expect(calculatePlatformFee(-1, 2)).toEqual({
      platformFeeAmount: 0,
      merchantNetAmount: 0,
    });
  });
});
