/**
 * Unit Tests for Variant Registry
 * 
 * Tests for:
 * - getVariantsForSection()
 * - getVariant()
 * - getDefaultVariant()
 * - getSuggestedVariants()
 * - hasVariants()
 * - getSectionsWithVariants()
 */

import { describe, it, expect } from 'vitest';
import {
  SECTION_VARIANTS,
  HERO_VARIANTS,
  TESTIMONIALS_VARIANTS,
  CTA_VARIANTS,
  FEATURES_VARIANTS,
  SOCIAL_PROOF_VARIANTS,
  getVariantsForSection,
  getVariant,
  getDefaultVariant,
  getSuggestedVariants,
  hasVariants,
  getSectionsWithVariants,
} from '~/utils/landing-builder/variantRegistry';

describe('Variant Registry', () => {
  describe('SECTION_VARIANTS constant', () => {
    it('should have hero variants', () => {
      expect(SECTION_VARIANTS.hero).toBeDefined();
      expect(SECTION_VARIANTS.hero.length).toBe(4);
    });

    it('should have testimonials variants', () => {
      expect(SECTION_VARIANTS.testimonials).toBeDefined();
      expect(SECTION_VARIANTS.testimonials.length).toBe(5);
    });

    it('should have cta variants', () => {
      expect(SECTION_VARIANTS.cta).toBeDefined();
      expect(SECTION_VARIANTS.cta.length).toBe(3);
    });

    it('should have features variants', () => {
      expect(SECTION_VARIANTS.features).toBeDefined();
      expect(SECTION_VARIANTS.features.length).toBe(3);
    });

    it('should have social variants', () => {
      expect(SECTION_VARIANTS.social).toBeDefined();
      expect(SECTION_VARIANTS.social.length).toBe(3);
    });
  });

  describe('Hero Variants', () => {
    it('should have product-focused variant', () => {
      const variant = HERO_VARIANTS.find(v => v.id === 'product-focused');
      expect(variant).toBeDefined();
      expect(variant?.sectionId).toBe('hero');
      expect(variant?.name).toBe('প্রোডাক্ট ফোকাস');
    });

    it('should have offer-focused variant', () => {
      const variant = HERO_VARIANTS.find(v => v.id === 'offer-focused');
      expect(variant).toBeDefined();
      expect(variant?.tags).toContain('urgency');
    });

    it('should have video-focused variant', () => {
      const variant = HERO_VARIANTS.find(v => v.id === 'video-focused');
      expect(variant).toBeDefined();
      expect(variant?.compatibleWith).toContain('tiktok');
    });

    it('should have text-focused variant', () => {
      const variant = HERO_VARIANTS.find(v => v.id === 'text-focused');
      expect(variant).toBeDefined();
      expect(variant?.tags).toContain('minimal');
    });

    it('all variants should have required fields', () => {
      HERO_VARIANTS.forEach(variant => {
        expect(variant.id).toBeDefined();
        expect(variant.sectionId).toBe('hero');
        expect(variant.name).toBeDefined();
        expect(variant.nameEn).toBeDefined();
        expect(variant.description).toBeDefined();
        expect(variant.tags).toBeInstanceOf(Array);
        expect(variant.compatibleWith).toBeInstanceOf(Array);
      });
    });
  });

  describe('Testimonials Variants', () => {
    it('should have 5 variants', () => {
      expect(TESTIMONIALS_VARIANTS).toHaveLength(5);
    });

    it('should have cards, carousel, avatars, screenshots, star-rating', () => {
      const ids = TESTIMONIALS_VARIANTS.map(v => v.id);
      expect(ids).toContain('cards');
      expect(ids).toContain('carousel');
      expect(ids).toContain('avatars');
      expect(ids).toContain('screenshots');
      expect(ids).toContain('star-rating');
    });

    it('screenshots variant should be good for Facebook', () => {
      const variant = TESTIMONIALS_VARIANTS.find(v => v.id === 'screenshots');
      expect(variant?.compatibleWith).toContain('facebook');
      expect(variant?.tags).toContain('authentic');
    });
  });

  describe('CTA Variants', () => {
    it('should have 3 variants', () => {
      expect(CTA_VARIANTS).toHaveLength(3);
    });

    it('urgency variant should have scarcity tag', () => {
      const variant = CTA_VARIANTS.find(v => v.id === 'urgency');
      expect(variant?.tags).toContain('urgency');
      expect(variant?.tags).toContain('scarcity');
    });

    it('with-trust variant should be good for direct sales', () => {
      const variant = CTA_VARIANTS.find(v => v.id === 'with-trust');
      expect(variant?.compatibleWith).toContain('direct_sales');
    });
  });

  describe('getVariantsForSection', () => {
    it('should return hero variants for hero section', () => {
      const variants = getVariantsForSection('hero');
      expect(variants).toHaveLength(4);
      expect(variants[0].sectionId).toBe('hero');
    });

    it('should return testimonials variants for testimonials section', () => {
      const variants = getVariantsForSection('testimonials');
      expect(variants).toHaveLength(5);
    });

    it('should return empty array for unknown section', () => {
      const variants = getVariantsForSection('unknown-section');
      expect(variants).toEqual([]);
    });

    it('should return empty array for section without variants', () => {
      const variants = getVariantsForSection('faq');
      expect(variants).toEqual([]);
    });
  });

  describe('getVariant', () => {
    it('should return specific variant by section and id', () => {
      const variant = getVariant('hero', 'product-focused');
      expect(variant).toBeDefined();
      expect(variant?.id).toBe('product-focused');
      expect(variant?.sectionId).toBe('hero');
    });

    it('should return undefined for non-existent variant', () => {
      const variant = getVariant('hero', 'non-existent');
      expect(variant).toBeUndefined();
    });

    it('should return undefined for non-existent section', () => {
      const variant = getVariant('non-existent', 'product-focused');
      expect(variant).toBeUndefined();
    });
  });

  describe('getDefaultVariant', () => {
    it('should return product-focused for hero', () => {
      const defaultVariant = getDefaultVariant('hero');
      expect(defaultVariant).toBe('product-focused');
    });

    it('should return screenshots for testimonials', () => {
      const defaultVariant = getDefaultVariant('testimonials');
      expect(defaultVariant).toBe('screenshots');
    });

    it('should return with-trust for cta', () => {
      const defaultVariant = getDefaultVariant('cta');
      expect(defaultVariant).toBe('with-trust');
    });

    it('should return grid-3 for features', () => {
      const defaultVariant = getDefaultVariant('features');
      expect(defaultVariant).toBe('grid-3');
    });

    it('should return counter for social', () => {
      const defaultVariant = getDefaultVariant('social');
      expect(defaultVariant).toBe('counter');
    });

    it('should return empty string for section without variants', () => {
      const defaultVariant = getDefaultVariant('faq');
      expect(defaultVariant).toBe('');
    });
  });

  describe('getSuggestedVariants', () => {
    it('should suggest variants based on direct_sales goal', () => {
      const intent = { goal: 'direct_sales', trafficSource: 'facebook' };
      const suggested = getSuggestedVariants('hero', intent);

      expect(suggested.length).toBeGreaterThan(0);
      // All suggested variants should be compatible with direct_sales or facebook
      suggested.forEach(v => {
        const isCompatible = 
          v.compatibleWith.includes('direct_sales') || 
          v.compatibleWith.includes('facebook');
        expect(isCompatible).toBe(true);
      });
    });

    it('should suggest video-focused hero for TikTok', () => {
      const intent = { goal: 'direct_sales', trafficSource: 'tiktok' };
      const suggested = getSuggestedVariants('hero', intent);

      const hasVideoFocused = suggested.some(v => v.id === 'video-focused');
      expect(hasVideoFocused).toBe(true);
    });

    it('should suggest screenshots testimonials for Facebook', () => {
      const intent = { goal: 'direct_sales', trafficSource: 'facebook' };
      const suggested = getSuggestedVariants('testimonials', intent);

      const hasScreenshots = suggested.some(v => v.id === 'screenshots');
      expect(hasScreenshots).toBe(true);
    });

    it('should return empty array for section without variants', () => {
      const intent = { goal: 'direct_sales', trafficSource: 'facebook' };
      const suggested = getSuggestedVariants('faq', intent);

      expect(suggested).toEqual([]);
    });
  });

  describe('hasVariants', () => {
    it('should return true for hero', () => {
      expect(hasVariants('hero')).toBe(true);
    });

    it('should return true for testimonials', () => {
      expect(hasVariants('testimonials')).toBe(true);
    });

    it('should return true for cta', () => {
      expect(hasVariants('cta')).toBe(true);
    });

    it('should return true for features', () => {
      expect(hasVariants('features')).toBe(true);
    });

    it('should return true for social', () => {
      expect(hasVariants('social')).toBe(true);
    });

    it('should return false for faq', () => {
      expect(hasVariants('faq')).toBe(false);
    });

    it('should return false for trust', () => {
      expect(hasVariants('trust')).toBe(false);
    });

    it('should return false for unknown section', () => {
      expect(hasVariants('unknown')).toBe(false);
    });
  });

  describe('getSectionsWithVariants', () => {
    it('should return all sections with variants', () => {
      const sections = getSectionsWithVariants();

      expect(sections).toContain('hero');
      expect(sections).toContain('testimonials');
      expect(sections).toContain('cta');
      expect(sections).toContain('features');
      expect(sections).toContain('social');
    });

    it('should not include sections without variants', () => {
      const sections = getSectionsWithVariants();

      expect(sections).not.toContain('faq');
      expect(sections).not.toContain('trust');
      expect(sections).not.toContain('guarantee');
    });

    it('should return exactly 5 sections', () => {
      const sections = getSectionsWithVariants();
      expect(sections).toHaveLength(5);
    });
  });

  describe('Variant Structure Validation', () => {
    const allVariants = [
      ...HERO_VARIANTS,
      ...TESTIMONIALS_VARIANTS,
      ...CTA_VARIANTS,
      ...FEATURES_VARIANTS,
      ...SOCIAL_PROOF_VARIANTS,
    ];

    it('all variants should have unique IDs within their section', () => {
      Object.entries(SECTION_VARIANTS).forEach(([sectionId, variants]) => {
        const ids = variants.map(v => v.id);
        const uniqueIds = [...new Set(ids)];
        expect(ids.length).toBe(uniqueIds.length);
      });
    });

    it('all variants should have Bangla name', () => {
      allVariants.forEach(variant => {
        expect(variant.name).toBeDefined();
        expect(variant.name.length).toBeGreaterThan(0);
      });
    });

    it('all variants should have English name', () => {
      allVariants.forEach(variant => {
        expect(variant.nameEn).toBeDefined();
        expect(variant.nameEn.length).toBeGreaterThan(0);
      });
    });

    it('all variants should have at least one tag', () => {
      allVariants.forEach(variant => {
        expect(variant.tags.length).toBeGreaterThan(0);
      });
    });

    it('all variants should have at least one compatibility', () => {
      allVariants.forEach(variant => {
        expect(variant.compatibleWith.length).toBeGreaterThan(0);
      });
    });
  });
});
