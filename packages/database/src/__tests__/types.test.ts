import { describe, it, expect } from 'vitest';
import { parseLandingConfig } from '../types';

describe('parseLandingConfig', () => {
  it('should return null if input is null', () => {
    expect(parseLandingConfig(null)).toBeNull();
  });

  it('should return null if input is an empty string', () => {
    expect(parseLandingConfig('')).toBeNull();
  });

  it('should return null if input is invalid JSON', () => {
    expect(parseLandingConfig('invalid json')).toBeNull();
    expect(parseLandingConfig('{')).toBeNull();
    expect(parseLandingConfig('{"foo": "bar"')).toBeNull();
  });

  it('should parse valid JSON correctly', () => {
    const validConfig = {
      headline: 'Test Headline',
      ctaText: 'Buy Now'
    };

    expect(parseLandingConfig(JSON.stringify(validConfig))).toEqual(validConfig);
  });

  it('should parse an empty object correctly', () => {
    expect(parseLandingConfig('{}')).toEqual({});
  });
});
