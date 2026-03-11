import { describe, it, expect } from 'vitest';
import { parseThemeConfig } from '../types';

describe('parseThemeConfig', () => {
  it('returns null when input is null', () => {
    expect(parseThemeConfig(null)).toBeNull();
  });

  it('returns null when input is undefined', () => {
    // @ts-expect-error Testing invalid input
    expect(parseThemeConfig(undefined)).toBeNull();
  });

  it('returns null when input is an empty string', () => {
    expect(parseThemeConfig('')).toBeNull();
  });

  it('returns the input object directly when given an object', () => {
    const input = { primaryColor: '#ffffff' };
    expect(parseThemeConfig(input)).toBe(input);
  });

  it('parses a valid JSON string and returns the object', () => {
    const input = '{"primaryColor":"#ffffff"}';
    expect(parseThemeConfig(input)).toEqual({ primaryColor: '#ffffff' });
  });

  it('returns null when given an invalid JSON string', () => {
    const input = 'invalid json';
    expect(parseThemeConfig(input)).toBeNull();
  });
});
