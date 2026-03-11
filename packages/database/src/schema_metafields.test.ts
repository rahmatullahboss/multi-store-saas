import { describe, it, expect } from 'vitest';
import { validateMetafieldValue } from './schema_metafields';

describe('validateMetafieldValue', () => {
  describe('number_integer', () => {
    it('returns valid for a whole number', () => {
      const result = validateMetafieldValue(42, 'number_integer');
      expect(result).toEqual({ valid: true });
    });

    it('returns valid for zero and negative whole numbers', () => {
      expect(validateMetafieldValue(0, 'number_integer')).toEqual({ valid: true });
      expect(validateMetafieldValue(-5, 'number_integer')).toEqual({ valid: true });
    });

    it('returns error if value is not a number', () => {
      expect(validateMetafieldValue('42', 'number_integer')).toEqual({ valid: false, error: 'Must be a whole number' });
      expect(validateMetafieldValue(null, 'number_integer')).toEqual({ valid: false, error: 'Must be a whole number' });
      expect(validateMetafieldValue(undefined, 'number_integer')).toEqual({ valid: false, error: 'Must be a whole number' });
    });

    it('returns error if value is a decimal', () => {
      expect(validateMetafieldValue(42.5, 'number_integer')).toEqual({ valid: false, error: 'Must be a whole number' });
    });

    it('validates min bound', () => {
      expect(validateMetafieldValue(5, 'number_integer', { min: 10 })).toEqual({ valid: false, error: 'Minimum value is 10' });
      expect(validateMetafieldValue(10, 'number_integer', { min: 10 })).toEqual({ valid: true });
      expect(validateMetafieldValue(15, 'number_integer', { min: 10 })).toEqual({ valid: true });
    });

    it('validates max bound', () => {
      expect(validateMetafieldValue(15, 'number_integer', { max: 10 })).toEqual({ valid: false, error: 'Maximum value is 10' });
      expect(validateMetafieldValue(10, 'number_integer', { max: 10 })).toEqual({ valid: true });
      expect(validateMetafieldValue(5, 'number_integer', { max: 10 })).toEqual({ valid: true });
    });

    it('validates min and max bounds together', () => {
      expect(validateMetafieldValue(5, 'number_integer', { min: 10, max: 20 })).toEqual({ valid: false, error: 'Minimum value is 10' });
      expect(validateMetafieldValue(25, 'number_integer', { min: 10, max: 20 })).toEqual({ valid: false, error: 'Maximum value is 20' });
      expect(validateMetafieldValue(15, 'number_integer', { min: 10, max: 20 })).toEqual({ valid: true });
    });
  });

  describe('number_decimal', () => {
    it('returns valid for a decimal and whole numbers', () => {
      expect(validateMetafieldValue(42.5, 'number_decimal')).toEqual({ valid: true });
      expect(validateMetafieldValue(42, 'number_decimal')).toEqual({ valid: true });
      expect(validateMetafieldValue(-42.5, 'number_decimal')).toEqual({ valid: true });
    });

    it('returns error if value is not a number', () => {
      expect(validateMetafieldValue('42.5', 'number_decimal')).toEqual({ valid: false, error: 'Must be a number' });
      expect(validateMetafieldValue(null, 'number_decimal')).toEqual({ valid: false, error: 'Must be a number' });
    });

    it('validates min and max bounds', () => {
      expect(validateMetafieldValue(5.5, 'number_decimal', { min: 10.5 })).toEqual({ valid: false, error: 'Minimum value is 10.5' });
      expect(validateMetafieldValue(15.5, 'number_decimal', { max: 10.5 })).toEqual({ valid: false, error: 'Maximum value is 10.5' });
      expect(validateMetafieldValue(10.5, 'number_decimal', { min: 5.5, max: 15.5 })).toEqual({ valid: true });
    });
  });

  describe('single_line_text_field', () => {
    it('returns valid for string', () => {
      expect(validateMetafieldValue('hello', 'single_line_text_field')).toEqual({ valid: true });
      expect(validateMetafieldValue('', 'single_line_text_field')).toEqual({ valid: true });
    });

    it('returns error if value is not a string', () => {
      expect(validateMetafieldValue(42, 'single_line_text_field')).toEqual({ valid: false, error: 'Must be text' });
      expect(validateMetafieldValue(null, 'single_line_text_field')).toEqual({ valid: false, error: 'Must be text' });
    });

    it('validates max length', () => {
      expect(validateMetafieldValue('hello world', 'single_line_text_field', { max: 5 })).toEqual({ valid: false, error: 'Maximum 5 characters' });
      expect(validateMetafieldValue('hello', 'single_line_text_field', { max: 5 })).toEqual({ valid: true });
    });

    it('validates regex', () => {
      expect(validateMetafieldValue('123', 'single_line_text_field', { regex: '^[a-z]+$' })).toEqual({ valid: false, error: 'Invalid format' });
      expect(validateMetafieldValue('abc', 'single_line_text_field', { regex: '^[a-z]+$' })).toEqual({ valid: true });
    });

    it('validates choices', () => {
      expect(validateMetafieldValue('red', 'single_line_text_field', { choices: ['blue', 'green'] })).toEqual({ valid: false, error: 'Must be one of: blue, green' });
      expect(validateMetafieldValue('blue', 'single_line_text_field', { choices: ['blue', 'green'] })).toEqual({ valid: true });
    });
  });

  describe('url', () => {
    it('returns valid for a proper URL', () => {
      expect(validateMetafieldValue('https://example.com', 'url')).toEqual({ valid: true });
      expect(validateMetafieldValue('http://test.org/path?q=1', 'url')).toEqual({ valid: true });
    });

    it('returns error if not a string', () => {
      expect(validateMetafieldValue(42, 'url')).toEqual({ valid: false, error: 'Must be a URL' });
    });

    it('returns error for invalid URL format', () => {
      expect(validateMetafieldValue('not-a-url', 'url')).toEqual({ valid: false, error: 'Invalid URL format' });
    });
  });

  describe('color', () => {
    it('returns valid for hex color', () => {
      expect(validateMetafieldValue('#FF5500', 'color')).toEqual({ valid: true });
      expect(validateMetafieldValue('#fff000', 'color')).toEqual({ valid: true });
    });

    it('returns error if not a string or invalid hex', () => {
      expect(validateMetafieldValue(42, 'color')).toEqual({ valid: false, error: 'Must be a hex color (e.g., #FF5500)' });
      expect(validateMetafieldValue('red', 'color')).toEqual({ valid: false, error: 'Must be a hex color (e.g., #FF5500)' });
      expect(validateMetafieldValue('#FF550', 'color')).toEqual({ valid: false, error: 'Must be a hex color (e.g., #FF5500)' });
    });
  });

  describe('boolean', () => {
    it('returns valid for boolean true and false', () => {
      expect(validateMetafieldValue(true, 'boolean')).toEqual({ valid: true });
      expect(validateMetafieldValue(false, 'boolean')).toEqual({ valid: true });
    });

    it('returns error if not a boolean', () => {
      expect(validateMetafieldValue('true', 'boolean')).toEqual({ valid: false, error: 'Must be true or false' });
      expect(validateMetafieldValue(1, 'boolean')).toEqual({ valid: false, error: 'Must be true or false' });
      expect(validateMetafieldValue(null, 'boolean')).toEqual({ valid: false, error: 'Must be true or false' });
    });
  });

  describe('unvalidated types', () => {
    it('returns valid for types with no specific validation', () => {
      // By default, it returns { valid: true } if no case is matched
      expect(validateMetafieldValue('anything', 'json')).toEqual({ valid: true });
      expect(validateMetafieldValue({ complex: 'object' }, 'json')).toEqual({ valid: true });
      expect(validateMetafieldValue('some-date', 'date')).toEqual({ valid: true });
    });
  });
});
