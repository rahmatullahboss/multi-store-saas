import { describe, it, expect } from 'vitest';
import { calculateDiscountPercentage, formatCurrency, parsePriceRange } from '~/utils/price';

describe('price utility functions', () => {
  describe('calculateDiscountPercentage', () => {
    it('should calculate discount percentage correctly', () => {
      expect(calculateDiscountPercentage(80, 100)).toBe(20);
      expect(calculateDiscountPercentage(50, 200)).toBe(75);
    });

    it('should return 0 if compareAtPrice is missing or less than/equal to price', () => {
      expect(calculateDiscountPercentage(100, 0)).toBe(0);
      expect(calculateDiscountPercentage(100, 80)).toBe(0);
      expect(calculateDiscountPercentage(100, 100)).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format BDT currency properly', () => {
      const result = formatCurrency(1500);
      // Depending on locale string for 'en-BD' and browser/Node version,
      // symbol might be 'BDT' or '৳'
      expect(result).toMatch(/(৳|BDT)/);
      // For BDT maximumFractionDigits is 0
      expect(result).toMatch(/1,500/);
    });

    it('should format USD currency properly', () => {
      const result = formatCurrency(1500.5, 'USD');
      expect(result).toContain('$');
      expect(result).toMatch(/1,500\.50?/);
    });
  });

  describe('parsePriceRange', () => {
    it('should parse valid price range', () => {
      const result = parsePriceRange('100', '500');
      expect(result.minPrice).toBe(100);
      expect(result.maxPrice).toBe(500);
    });

    it('should handle null or missing values', () => {
      expect(parsePriceRange(null, '500')).toEqual({ minPrice: null, maxPrice: 500 });
      expect(parsePriceRange('100', null)).toEqual({ minPrice: 100, maxPrice: null });
      expect(parsePriceRange()).toEqual({ minPrice: null, maxPrice: null });
    });

    it('should handle invalid string values gracefully', () => {
      const result = parsePriceRange('invalid', '-50');
      expect(result.minPrice).toBe(null);
      expect(result.maxPrice).toBe(null);
    });
  });
});
