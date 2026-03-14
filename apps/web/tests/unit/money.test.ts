import { describe, it, expect } from 'vitest';
import {
  toCents,
  fromCents,
  roundMoney,
  formatMoney,
  formatCurrency,
  formatMoneyFromCents,
  addMoney,
  subtractMoney,
  multiplyMoney,
  percentOfMoney,
  applyDiscount,
  compareMoney,
  moneyEquals,
  meetsMinimum,
  isValidMoney,
  parseMoney,
  calculateOrderTotals,
  getCurrencyConfig,
} from '~/utils/money';

describe('money utility functions', () => {
  describe('toCents and fromCents', () => {
    it('should convert display amount to cents correctly', () => {
      expect(toCents(100.5)).toBe(10050);
      expect(toCents(10.99)).toBe(1099);
      expect(toCents(0)).toBe(0);
    });

    it('should convert cents to display amount correctly', () => {
      expect(fromCents(10050)).toBe(100.5);
      expect(fromCents(1099)).toBe(10.99);
      expect(fromCents(0)).toBe(0);
    });
  });

  describe('roundMoney', () => {
    it('should correctly round money', () => {
      expect(roundMoney(100.123)).toBe(100.12);
      expect(roundMoney(100.125)).toBe(100.13);
      expect(roundMoney(100.129)).toBe(100.13);
      expect(roundMoney(100)).toBe(100);
    });
  });

  describe('formatMoney and formatCurrency', () => {
    it('should format money with defaults', () => {
      const result = formatMoney(1500.5);
      expect(result).toContain('৳');
      expect(result).toContain('1,500.50');
    });

    it('should format money with explicit currency and hide symbol', () => {
      const result = formatMoney(1500.5, { currency: 'USD', showSymbol: false });
      expect(result).not.toContain('$');
      expect(result).toContain('1,500.50');
    });

    it('should format currency correctly using config', () => {
      const bdt = formatCurrency(1500);
      expect(bdt).toContain('৳');
      // BDT has decimals: 0 by config
      // Allow for Bengali numerals using regex matching '1,500' or '১,৫০০'
      expect(bdt).toMatch(/(1,500|১,৫০০)/);

      const usd = formatCurrency(1500.5, 'USD');
      expect(usd).toContain('$');
      expect(usd).toMatch(/1,500\.50?/);
    });

    it('should get correct currency config', () => {
      expect(getCurrencyConfig('USD').code).toBe('USD');
      expect(getCurrencyConfig('UNKNOWN').code).toBe('BDT'); // Fallback
    });

    it('should format money from cents', () => {
      const result = formatMoneyFromCents(150050);
      expect(result).toContain('৳');
      expect(result).toContain('1,500.50');
    });
  });

  describe('arithmetic functions', () => {
    it('should safely add money', () => {
      expect(addMoney(10.1, 20.2)).toBe(30.3);
      expect(addMoney(0.1, 0.2)).toBe(0.3); // Typical floating point issue
    });

    it('should safely subtract money', () => {
      expect(subtractMoney(30.3, 10.1)).toBe(20.2);
      expect(subtractMoney(0.3, 0.2)).toBe(0.1); // Typical floating point issue
    });

    it('should safely multiply money', () => {
      expect(multiplyMoney(10.5, 3)).toBe(31.5);
      expect(multiplyMoney(33.33, 3)).toBe(99.99);
    });

    it('should calculate percentage of money', () => {
      expect(percentOfMoney(1000, 10)).toBe(100);
      expect(percentOfMoney(99.99, 15)).toBe(15);
    });

    it('should apply discount', () => {
      expect(applyDiscount(1000, 10)).toBe(900);
      expect(applyDiscount(50.5, 20)).toBe(40.4);
    });
  });

  describe('comparison functions', () => {
    it('should correctly compare money', () => {
      expect(compareMoney(10.5, 20.5)).toBe(-1);
      expect(compareMoney(20.5, 10.5)).toBe(1);
      expect(compareMoney(10.5, 10.5)).toBe(0);
      expect(compareMoney(0.1 + 0.2, 0.3)).toBe(0);
    });

    it('should correctly evaluate money equals', () => {
      expect(moneyEquals(10.5, 10.5)).toBe(true);
      expect(moneyEquals(0.1 + 0.2, 0.3)).toBe(true);
      expect(moneyEquals(10.5, 20.5)).toBe(false);
    });

    it('should check if amount meets minimum', () => {
      expect(meetsMinimum(100, 50)).toBe(true);
      expect(meetsMinimum(100, 100)).toBe(true);
      expect(meetsMinimum(50, 100)).toBe(false);
    });
  });

  describe('validation and parsing functions', () => {
    it('should correctly validate money', () => {
      expect(isValidMoney(100)).toBe(true);
      expect(isValidMoney(0)).toBe(true);
      expect(isValidMoney(100.5)).toBe(true);
      expect(isValidMoney(-50)).toBe(false);
      expect(isValidMoney(NaN)).toBe(false);
      expect(isValidMoney('100')).toBe(false);
    });

    it('should parse money from strings', () => {
      expect(parseMoney('1,500.50')).toBe(1500.5);
      expect(parseMoney('৳ 1,500.50')).toBe(1500.5);
      expect(parseMoney('$1500.50')).toBe(1500.5);
      expect(parseMoney('invalid')).toBe(null);
    });
  });

  describe('calculateOrderTotals', () => {
    it('should correctly calculate order totals', () => {
      const items = [
        { price: 100, quantity: 2 }, // 200
        { price: 50, quantity: 1 },  // 50
      ]; // subtotal = 250

      const result = calculateOrderTotals({
        items,
        discountPercent: 10, // 25
        shippingCost: 50,
        taxPercent: 5, // tax on 225 = 11.25
      });

      expect(result.subtotal).toBe(250);
      expect(result.discount).toBe(25);
      expect(result.shipping).toBe(50);
      expect(result.tax).toBe(11.25);
      expect(result.total).toBe(286.25); // 225 + 50 + 11.25
    });

    it('should apply fixed discount correctly', () => {
      const items = [
        { price: 100, quantity: 2 }, // 200
      ]; // subtotal = 200

      const result = calculateOrderTotals({
        items,
        discountFixed: 50, // 50
        shippingCost: 0,
      });

      expect(result.subtotal).toBe(200);
      expect(result.discount).toBe(50);
      expect(result.total).toBe(150);
    });
  });
});
