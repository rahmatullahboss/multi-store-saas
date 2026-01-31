import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('should format prices correctly (USD)', () => {
    // 1500 = 1,500 US$ (taka format, Intl uses non-breaking space)
    const result = formatPrice(1500, { currency: 'USD' });
    expect(result).toMatch(/1,500\sUS\$/);
  });

  it('should format prices correctly (BDT)', () => {
    // 1500 = ৳1,500 (taka format with Bengali numerals via bn-BD locale)
    const result = formatPrice(1500, { currency: 'BDT', locale: 'bn' });
    expect(result).toMatch(/৳[\d০-৯,]+/);
  });

  it('should handle small amounts (USD)', () => {
    // 0.5 = 0.5 US$
    const result = formatPrice(0.5, { currency: 'USD' });
    expect(result).toMatch(/0\.5\sUS\$/);
  });

  it('should handle small amounts (BDT)', () => {
    // 1 = ৳1
    const result = formatPrice(1, { currency: 'BDT', locale: 'bn' });
    expect(result).toMatch(/৳[\d০-৯]+/);
  });

  it('should respect showSymbol option', () => {
    expect(formatPrice(1500, { currency: 'USD', showSymbol: false })).toBe('1,500');
  });

  it('should format zero correctly', () => {
    // 0 = 0 US$
    const result = formatPrice(0, { currency: 'USD' });
    expect(result).toMatch(/0\sUS\$/);
  });

  it('should handle very large numbers', () => {
    // 10 million - format depends on locale (may use Indian or Western grouping)
    const result = formatPrice(10000000, { currency: 'USD' });
    expect(result).toMatch(/[\d,]+\sUS\$/);
    expect(result).toContain('US$');
  });
});
