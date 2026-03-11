import { describe, it, expect } from 'vitest';
import { normalizePhone, isValidBDPhone } from '../../app/services/fraud-engine.server';

describe('fraud-engine.server', () => {
  describe('normalizePhone', () => {
    it('should handle standard BD numbers', () => {
      expect(normalizePhone('01712345678')).toBe('01712345678');
      expect(normalizePhone('01998765432')).toBe('01998765432');
    });

    it('should handle +880 prefix', () => {
      expect(normalizePhone('+8801712345678')).toBe('01712345678');
      expect(normalizePhone('+880 199 876 5432')).toBe('01998765432');
    });

    it('should handle 880 prefix', () => {
      expect(normalizePhone('8801712345678')).toBe('01712345678');
    });

    it('should handle 10-digit numbers starting with 1', () => {
      expect(normalizePhone('1712345678')).toBe('01712345678');
    });

    it('should ignore non-digit characters', () => {
      expect(normalizePhone('(017) 123-45678')).toBe('01712345678');
      expect(normalizePhone('01712-345-678 ext. 123')).toBe('01712345678123');
    });
  });

  describe('isValidBDPhone', () => {
    it('should validate valid prefixes (013-019)', () => {
      expect(isValidBDPhone('01312345678')).toBe(true);
      expect(isValidBDPhone('01412345678')).toBe(true);
      expect(isValidBDPhone('01512345678')).toBe(true);
      expect(isValidBDPhone('01612345678')).toBe(true);
      expect(isValidBDPhone('01712345678')).toBe(true);
      expect(isValidBDPhone('01812345678')).toBe(true);
      expect(isValidBDPhone('01912345678')).toBe(true);
    });

    it('should invalidate invalid prefixes (010-012)', () => {
      expect(isValidBDPhone('01012345678')).toBe(false);
      expect(isValidBDPhone('01112345678')).toBe(false);
      expect(isValidBDPhone('01212345678')).toBe(false);
    });

    it('should invalidate wrong lengths', () => {
      expect(isValidBDPhone('0171234567')).toBe(false); // 10 digits
      expect(isValidBDPhone('017123456789')).toBe(false); // 12 digits
    });

    it('should normalize before validation', () => {
      expect(isValidBDPhone('+8801712345678')).toBe(true);
      expect(isValidBDPhone('8801712345678')).toBe(true);
      expect(isValidBDPhone('1712345678')).toBe(true);
      expect(isValidBDPhone('(017) 123-45678')).toBe(true);
      expect(isValidBDPhone('+8801112345678')).toBe(false); // invalid prefix
    });
  });
});
