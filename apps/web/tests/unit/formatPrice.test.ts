import { describe, it, expect } from 'vitest';
import { formatPrice, getCurrencySymbol, formatPriceSimple } from '~/utils/formatPrice';

describe('formatPrice utility function', () => {
  describe('formatPrice', () => {
    it('should format USD prices correctly by default', () => {
      // Depending on Node.js Intl version, it might return $1,000.50 or $1,000.5, etc.
      // So let's check for standard features of USD formatting.
      const result = formatPrice(1000.5);
      expect(result).toMatch(/1,000\.50?/);
      expect(result).toContain('$');
    });

    it('should format BDT prices correctly with Bengali locale and Latin numerals', () => {
      const result = formatPrice(1000.5, { locale: 'bn', currency: 'BDT' });
      // BDT has maximumFractionDigits: 0
      expect(result).toMatch(/1,00[01]/); // 1000.5 may be rounded to 1000 or 1001
      expect(result).toContain('৳');
    });

    it('should format EUR prices correctly', () => {
      const result = formatPrice(1000.5, { locale: 'en', currency: 'EUR' });
      expect(result).toMatch(/1,000\.50?/);
      expect(result).toContain('€');
    });

    it('should format GBP prices correctly', () => {
      const result = formatPrice(1000.5, { locale: 'en', currency: 'GBP' });
      expect(result).toMatch(/1,000\.50?/);
      expect(result).toContain('£');
    });

    it('should hide the currency symbol when showSymbol is false', () => {
      const result = formatPrice(1000.5, { showSymbol: false, currency: 'USD' });
      expect(result).toMatch(/1,000\.50?/);
      expect(result).not.toContain('$');
    });

    it('should use fallback when an unsupported currency is passed', () => {
      // We pass an unsupported currency code and type casting to test the fallback branch
      const result = formatPrice(1000.5, { currency: 'XYZ' as any });
      // The fallback uses fixed(2) so we expect $1000.50 or XYZ 1,000.50
      expect(result).toMatch(/(\$1000\.50|XYZ\s1,000\.50?)/);
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return the correct symbol for BDT', () => {
      expect(getCurrencySymbol('BDT')).toBe('৳');
    });

    it('should return the correct symbol for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
    });

    it('should return the correct symbol for EUR', () => {
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('should return the correct symbol for GBP', () => {
      expect(getCurrencySymbol('GBP')).toBe('£');
    });

    it('should return fallback "$" for an unknown currency', () => {
      expect(getCurrencySymbol('XYZ' as any)).toBe('$');
    });
  });

  describe('formatPriceSimple', () => {
    it('should format USD prices correctly by default', () => {
      const result = formatPriceSimple(1000.5);
      expect(result).toMatch(/1,000\.50?/);
      expect(result).toContain('$');
    });

    it('should format custom currency correctly', () => {
      const result = formatPriceSimple(1000.5, 'EUR');
      expect(result).toMatch(/1,000\.50?/);
      expect(result).toContain('€');
    });
  });
});
