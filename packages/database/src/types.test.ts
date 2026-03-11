import { describe, it, expect } from 'vitest';
import {
  parseFooterConfig,
  parseSocialLinks,
  parseLandingConfig,
  parseThemeConfig,
  parseManualPaymentConfig,
  parseBusinessInfo,
  parseShippingConfig,
} from './types';

describe('Parsing Helpers', () => {
  describe('parseFooterConfig', () => {
    it('should parse valid JSON', () => {
      const config = {
        description: 'Test Description',
        links: [{ title: 'Home', url: '/' }],
        showPoweredBy: true,
        showTrustBadges: false,
      };
      const json = JSON.stringify(config);
      expect(parseFooterConfig(json)).toEqual(config);
    });

    it('should return null for null input', () => {
      expect(parseFooterConfig(null)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseFooterConfig('')).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      expect(parseFooterConfig('{ invalid }')).toBeNull();
    });
  });

  describe('parseSocialLinks', () => {
    it('should parse valid JSON', () => {
      const links = {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
      };
      const json = JSON.stringify(links);
      expect(parseSocialLinks(json)).toEqual(links);
    });

    it('should return null for null input', () => {
      expect(parseSocialLinks(null)).toBeNull();
    });
  });

  describe('parseLandingConfig', () => {
    it('should parse valid JSON', () => {
      const config = {
        headline: 'Test Headline',
        ctaText: 'Buy Now',
      };
      const json = JSON.stringify(config);
      expect(parseLandingConfig(json)).toMatchObject(config);
    });

    it('should return null for null input', () => {
      expect(parseLandingConfig(null)).toBeNull();
    });
  });

  describe('parseThemeConfig', () => {
    it('should parse valid JSON string', () => {
      const config = { primaryColor: '#000000', accentColor: '#ffffff' };
      const json = JSON.stringify(config);
      expect(parseThemeConfig(json)).toEqual(config);
    });

    it('should return object if input is already an object', () => {
      const config = { primaryColor: '#000000', accentColor: '#ffffff' } as any;
      expect(parseThemeConfig(config)).toBe(config);
    });

    it('should return null for null input', () => {
      expect(parseThemeConfig(null)).toBeNull();
    });
  });

  describe('parseManualPaymentConfig', () => {
    it('should parse valid JSON', () => {
      const config = { bkashPersonal: '01700000000' };
      const json = JSON.stringify(config);
      expect(parseManualPaymentConfig(json)).toEqual(config);
    });

    it('should return null for null input', () => {
      expect(parseManualPaymentConfig(null)).toBeNull();
    });
  });

  describe('parseBusinessInfo', () => {
    it('should parse valid JSON', () => {
      const info = { email: 'test@example.com' };
      const json = JSON.stringify(info);
      expect(parseBusinessInfo(json)).toEqual(info);
    });

    it('should return null for null input', () => {
      expect(parseBusinessInfo(null)).toBeNull();
    });
  });

  describe('parseShippingConfig', () => {
    it('should parse valid JSON', () => {
      const config = { deliveryCharge: 60 };
      const json = JSON.stringify(config);
      expect(parseShippingConfig(json)).toEqual(config);
    });

    it('should return null for null input', () => {
      expect(parseShippingConfig(null)).toBeNull();
    });
  });
});
