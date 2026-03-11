import { describe, it, expect } from 'vitest';
import { parseSocialLinks } from './types';

describe('parseSocialLinks', () => {
  it('should return null if input is null', () => {
    expect(parseSocialLinks(null)).toBeNull();
  });

  it('should return null if input is an empty string', () => {
    expect(parseSocialLinks('')).toBeNull();
  });

  it('should return a parsed object for valid JSON', () => {
    const validJson = JSON.stringify({
      facebook: 'https://facebook.com/test',
      twitter: 'https://twitter.com/test',
    });
    const result = parseSocialLinks(validJson);
    expect(result).toEqual({
      facebook: 'https://facebook.com/test',
      twitter: 'https://twitter.com/test',
    });
  });

  it('should return null for invalid JSON', () => {
    const invalidJson = '{"facebook": "https://facebook.com/test",}'; // Trailing comma
    expect(parseSocialLinks(invalidJson)).toBeNull();
  });

  it('should return null for non-JSON string', () => {
    const notJson = 'just a random string';
    expect(parseSocialLinks(notJson)).toBeNull();
  });
});
