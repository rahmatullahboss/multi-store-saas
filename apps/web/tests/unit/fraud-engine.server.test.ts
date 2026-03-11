import { describe, it, expect } from 'vitest';
import { normalizePhone } from '../../app/services/fraud-engine.server';

describe('normalizePhone', () => {
  it('should remove non-digit characters', () => {
    expect(normalizePhone('017-123-45678')).toBe('01712345678');
    expect(normalizePhone('017 123 45678')).toBe('01712345678');
    expect(normalizePhone('(017) 123-45678')).toBe('01712345678');
    expect(normalizePhone('+01712345678')).toBe('01712345678');
    expect(normalizePhone('abc01712345678def')).toBe('01712345678');
  });

  it('should replace 880 prefix with 0', () => {
    expect(normalizePhone('8801712345678')).toBe('01712345678');
    expect(normalizePhone('+8801712345678')).toBe('01712345678');
    // Ensure it does not replace if not enough digits (e.g. 880 inside a short number)
    expect(normalizePhone('8801712345')).toBe('8801712345');
  });

  it('should add leading 0 if starting with 1 and length is 10', () => {
    expect(normalizePhone('1712345678')).toBe('01712345678');
  });

  it('should handle already normalized numbers correctly', () => {
    expect(normalizePhone('01712345678')).toBe('01712345678');
  });

  it('should handle edge cases properly', () => {
    expect(normalizePhone('')).toBe('');
    expect(normalizePhone('   ')).toBe('');
    expect(normalizePhone('abcdef')).toBe('');
    expect(normalizePhone('12345')).toBe('12345');
    // Number starts with 880 but total length < 13
    expect(normalizePhone('88012')).toBe('88012');
    // Number starts with 1 but length != 10
    expect(normalizePhone('1712345')).toBe('1712345');
    expect(normalizePhone('17123456789')).toBe('17123456789');
  });
});
