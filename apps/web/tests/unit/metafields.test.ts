/**
 * Metafields Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  parseMetafieldValue,
  serializeMetafieldValue,
  validateMetafieldValue,
  getMetafieldDefaultValue,
  type MetafieldType,
} from '@db/schema_metafields';

describe('Metafields', () => {
  describe('parseMetafieldValue', () => {
    it('should parse integer value', () => {
      const result = parseMetafieldValue('42', 'number_integer');
      expect(result).toBe(42);
    });

    it('should parse decimal value', () => {
      const result = parseMetafieldValue('3.14', 'number_decimal');
      expect(result).toBeCloseTo(3.14);
    });

    it('should parse boolean true', () => {
      expect(parseMetafieldValue('true', 'boolean')).toBe(true);
      expect(parseMetafieldValue('1', 'boolean')).toBe(true);
    });

    it('should parse boolean false', () => {
      expect(parseMetafieldValue('false', 'boolean')).toBe(false);
      expect(parseMetafieldValue('0', 'boolean')).toBe(false);
    });

    it('should parse JSON value', () => {
      const result = parseMetafieldValue('{"key": "value"}', 'json');
      expect(result).toEqual({ key: 'value' });
    });

    it('should parse list value', () => {
      const result = parseMetafieldValue('["a", "b", "c"]', 'list.single_line_text_field');
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should return string for text types', () => {
      const result = parseMetafieldValue('Hello World', 'single_line_text_field');
      expect(result).toBe('Hello World');
    });

    it('should handle date parsing', () => {
      const result = parseMetafieldValue('2024-01-15', 'date');
      expect(result).toBeInstanceOf(Date);
    });

    it('should return original string on parsing failure (fallback)', () => {
      const malformedJson = 'malformed { json';
      const result = parseMetafieldValue(malformedJson, 'json');
      expect(result).toBe(malformedJson);
    });
  });

  describe('serializeMetafieldValue', () => {
    it('should serialize integer', () => {
      expect(serializeMetafieldValue(42, 'number_integer')).toBe('42');
    });

    it('should serialize decimal', () => {
      expect(serializeMetafieldValue(3.14, 'number_decimal')).toBe('3.14');
    });

    it('should serialize boolean', () => {
      expect(serializeMetafieldValue(true, 'boolean')).toBe('true');
      expect(serializeMetafieldValue(false, 'boolean')).toBe('false');
    });

    it('should serialize JSON', () => {
      const result = serializeMetafieldValue({ key: 'value' }, 'json');
      expect(result).toBe('{"key":"value"}');
    });

    it('should serialize list', () => {
      const result = serializeMetafieldValue(['a', 'b'], 'list.single_line_text_field');
      expect(result).toBe('["a","b"]');
    });

    it('should serialize date', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const result = serializeMetafieldValue(date, 'date');
      expect(result).toBe('2024-01-15');
    });

    it('should serialize date_time', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = serializeMetafieldValue(date, 'date_time');
      expect(result).toContain('2024-01-15');
    });
  });

  describe('validateMetafieldValue', () => {
    it('should validate integer within range', () => {
      const result = validateMetafieldValue(5, 'number_integer', { min: 0, max: 10 });
      expect(result.valid).toBe(true);
    });

    it('should fail integer below min', () => {
      const result = validateMetafieldValue(-5, 'number_integer', { min: 0 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum');
    });

    it('should fail integer above max', () => {
      const result = validateMetafieldValue(15, 'number_integer', { max: 10 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum');
    });

    it('should fail non-integer for integer type', () => {
      const result = validateMetafieldValue(3.14, 'number_integer');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('whole number');
    });

    it('should validate text max length', () => {
      const result = validateMetafieldValue('Hello', 'single_line_text_field', { max: 3 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum');
    });

    it('should validate text regex', () => {
      const validResult = validateMetafieldValue('ABC123', 'single_line_text_field', { regex: '^[A-Z0-9]+$' });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateMetafieldValue('abc', 'single_line_text_field', { regex: '^[A-Z0-9]+$' });
      expect(invalidResult.valid).toBe(false);
    });

    it('should validate text choices', () => {
      const validResult = validateMetafieldValue('red', 'single_line_text_field', { choices: ['red', 'green', 'blue'] });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateMetafieldValue('yellow', 'single_line_text_field', { choices: ['red', 'green', 'blue'] });
      expect(invalidResult.valid).toBe(false);
    });

    it('should validate URL format', () => {
      const validResult = validateMetafieldValue('https://example.com', 'url');
      expect(validResult.valid).toBe(true);

      const invalidResult = validateMetafieldValue('not-a-url', 'url');
      expect(invalidResult.valid).toBe(false);
    });

    it('should validate color format', () => {
      const validResult = validateMetafieldValue('#FF5500', 'color');
      expect(validResult.valid).toBe(true);

      const invalidResult = validateMetafieldValue('red', 'color');
      expect(invalidResult.valid).toBe(false);
    });

    it('should validate boolean type', () => {
      const validResult = validateMetafieldValue(true, 'boolean');
      expect(validResult.valid).toBe(true);

      const invalidResult = validateMetafieldValue('true', 'boolean');
      expect(invalidResult.valid).toBe(false);
    });
  });

  describe('getMetafieldDefaultValue', () => {
    it.each([
      { type: 'number_integer', expected: 0 },
      { type: 'number_decimal', expected: 0 },
      { type: 'boolean', expected: false },
      { type: 'list.single_line_text_field', expected: [] },
      { type: 'list.number_integer', expected: [] },
      { type: 'list.product_reference', expected: [] },
      { type: 'list.file_reference', expected: [] },
      { type: 'json', expected: {} },
      // String defaults
      { type: 'single_line_text_field', expected: '' },
      { type: 'multi_line_text_field', expected: '' },
      { type: 'rich_text_field', expected: '' },
      { type: 'date', expected: '' },
      { type: 'date_time', expected: '' },
      { type: 'url', expected: '' },
      { type: 'color', expected: '' },
      { type: 'file_reference', expected: '' },
      { type: 'product_reference', expected: '' },
      { type: 'collection_reference', expected: '' },
    ] as const)('should return $expected for $type', ({ type, expected }) => {
      expect(getMetafieldDefaultValue(type)).toEqual(expected);
    });
  });
});
