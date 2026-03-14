import { describe, it, expect } from 'vitest';
import { getTranslations, en, bn } from '~/utils/translations';

describe('translations utility', () => {
  describe('getTranslations', () => {
    it('should return English translations when locale is "en"', () => {
      const translations = getTranslations('en');
      expect(translations).toBe(en);
      expect(translations.home).toBe('Home');
      expect(translations.cart).toBe('Cart');
    });

    it('should return Bengali translations when locale is "bn"', () => {
      const translations = getTranslations('bn');
      expect(translations).toBe(bn);
      expect(translations.home).toBe('হোম');
      expect(translations.cart).toBe('কার্ট');
    });

    it('should default to English translations when an unsupported locale is provided', () => {
      // We pass an unsupported locale code and type cast to test fallback behavior
      const translations = getTranslations('fr' as any);
      expect(translations).toBe(en);
    });
  });

  describe('Translation structure', () => {
    it('should have matching keys for all supported locales', () => {
      const enKeys = Object.keys(en);
      const bnKeys = Object.keys(bn);

      expect(enKeys.length).toBeGreaterThan(0);
      expect(enKeys.length).toBe(bnKeys.length);

      // Check that every key in English exists in Bengali
      enKeys.forEach((key) => {
        expect(bnKeys).toContain(key);
      });
    });
  });
});
