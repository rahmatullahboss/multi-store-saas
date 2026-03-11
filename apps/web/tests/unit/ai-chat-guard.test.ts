import { describe, it, expect } from 'vitest';
import { detectLanguage } from '~/services/ai-chat-guard.server';

describe('detectLanguage', () => {
  it('detects Bengali correctly', () => {
    // Basic Bengali
    expect(detectLanguage('হ্যালো')).toBe('bn');
    // Bengali with punctuation
    expect(detectLanguage('আমি ভালো আছি!')).toBe('bn');
    // Bengali numbers
    expect(detectLanguage('আমার ১২৩ টাকা চাই')).toBe('bn');
    // Mixed Bengali and English, should still be detected as Bengali
    expect(detectLanguage('Hello, কেমন আছো?')).toBe('bn');
    // Single Bengali character
    expect(detectLanguage('অ')).toBe('bn');
  });

  it('detects English/default correctly', () => {
    // Basic English
    expect(detectLanguage('hello')).toBe('en');
    // English with punctuation
    expect(detectLanguage('how are you?')).toBe('en');
    // English numbers
    expect(detectLanguage('1234')).toBe('en');
    // Symbols only
    expect(detectLanguage('!!!')).toBe('en');
    // Empty string
    expect(detectLanguage('')).toBe('en');
    // Emojis only
    expect(detectLanguage('😊😊😊')).toBe('en');
  });
});
