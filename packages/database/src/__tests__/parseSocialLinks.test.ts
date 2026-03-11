import { describe, it, expect } from 'vitest';
import { parseSocialLinks, SocialLinks } from '../types';

describe('parseSocialLinks', () => {
  it('should return null when input is null', () => {
    expect(parseSocialLinks(null)).toBeNull();
  });

  it('should return null when input is empty string', () => {
    expect(parseSocialLinks('')).toBeNull();
  });

  it('should parse valid JSON correctly', () => {
    const validJson = JSON.stringify({
      facebook: 'https://facebook.com/example',
      twitter: 'https://twitter.com/example',
      instagram: 'https://instagram.com/example'
    });

    const expected: SocialLinks = {
      facebook: 'https://facebook.com/example',
      twitter: 'https://twitter.com/example',
      instagram: 'https://instagram.com/example'
    };

    expect(parseSocialLinks(validJson)).toEqual(expected);
  });

  it('should parse valid JSON with only some fields correctly', () => {
    const validJson = JSON.stringify({
      facebook: 'https://facebook.com/example'
    });

    const expected: SocialLinks = {
      facebook: 'https://facebook.com/example'
    };

    expect(parseSocialLinks(validJson)).toEqual(expected);
  });

  it('should return null when input is invalid JSON', () => {
    // Malformed JSON (missing quotes around keys and values)
    const invalidJson = "{facebook: 'https://facebook.com/example'}";
    expect(parseSocialLinks(invalidJson)).toBeNull();
  });

  it('should return null when input is completely arbitrary non-JSON string', () => {
    expect(parseSocialLinks('just a regular string')).toBeNull();
  });
});
