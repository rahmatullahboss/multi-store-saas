import { describe, it, expect } from 'vitest';
import { validateMetafieldValue } from './schema_metafields';

describe('validateMetafieldValue', () => {
  describe('single_line_text_field', () => {
    it('validates correctly against a regex pattern', () => {
      const validations = { regex: '^[A-Z]+$' };

      // Valid case: uppercase letters only
      const validResult = validateMetafieldValue('HELLO', 'single_line_text_field', validations);
      expect(validResult).toEqual({ valid: true });

      // Invalid case: lowercase letters
      const invalidResultLower = validateMetafieldValue('hello', 'single_line_text_field', validations);
      expect(invalidResultLower).toEqual({ valid: false, error: 'Invalid format' });

      // Invalid case: contains numbers
      const invalidResultNumbers = validateMetafieldValue('HELLO123', 'single_line_text_field', validations);
      expect(invalidResultNumbers).toEqual({ valid: false, error: 'Invalid format' });
    });

    it('validates correctly against max length', () => {
      const validations = { max: 10 };

      // Valid case: exactly 10 characters
      const validResult1 = validateMetafieldValue('1234567890', 'single_line_text_field', validations);
      expect(validResult1).toEqual({ valid: true });

      // Valid case: less than 10 characters
      const validResult2 = validateMetafieldValue('12345', 'single_line_text_field', validations);
      expect(validResult2).toEqual({ valid: true });

      // Invalid case: more than 10 characters
      const invalidResult = validateMetafieldValue('12345678901', 'single_line_text_field', validations);
      expect(invalidResult).toEqual({ valid: false, error: 'Maximum 10 characters' });
    });

    it('validates string type', () => {
      // Invalid case: not a string
      const invalidResult = validateMetafieldValue(123 as any, 'single_line_text_field');
      expect(invalidResult).toEqual({ valid: false, error: 'Must be text' });

      // Valid case: is a string
      const validResult = validateMetafieldValue('123', 'single_line_text_field');
      expect(validResult).toEqual({ valid: true });
    });
  });
});
