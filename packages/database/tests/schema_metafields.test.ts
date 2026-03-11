import { describe, it, expect } from 'vitest';
import { getMetafieldDefaultValue } from '../src/schema_metafields';
import type { MetafieldType } from '../src/schema_metafields';

describe('schema_metafields', () => {
  describe('getMetafieldDefaultValue', () => {
    it.each([
      ['number_integer', 0],
      ['number_decimal', 0],
      ['boolean', false],
      ['list.single_line_text_field', []],
      ['list.number_integer', []],
      ['list.product_reference', []],
      ['list.file_reference', []],
      ['json', {}],
      ['single_line_text_field', ''],
      ['multi_line_text_field', ''],
      ['color', ''],
      ['url', ''],
      ['unknown_type', ''],
    ] as const)('returns %2$s for %1$s', (type, expected) => {
      expect(getMetafieldDefaultValue(type as MetafieldType)).toEqual(expected);
    });
  });
});
