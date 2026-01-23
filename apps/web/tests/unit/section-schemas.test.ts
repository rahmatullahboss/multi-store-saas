/**
 * Section Schemas Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  SECTION_SCHEMA_MAP,
  SECTION_DEFINITION_MAP,
  getSectionDefaults,
  validateSection,
  getSectionDefinition,
  getSectionsWithBlocks,
  getAllowedBlocks,
  getMaxBlocks,
} from '~/lib/section-schemas';

describe('Section Schemas', () => {
  describe('SECTION_SCHEMA_MAP', () => {
    it('should have 9 section schemas defined', () => {
      const sectionTypes = Object.keys(SECTION_SCHEMA_MAP);
      expect(sectionTypes.length).toBe(9);
      expect(sectionTypes).toContain('hero');
      expect(sectionTypes).toContain('slideshow');
      expect(sectionTypes).toContain('featured-products');
      expect(sectionTypes).toContain('collection-list');
      expect(sectionTypes).toContain('testimonials');
      expect(sectionTypes).toContain('faq');
      expect(sectionTypes).toContain('rich-text');
      expect(sectionTypes).toContain('image-with-text');
      expect(sectionTypes).toContain('newsletter');
    });
  });

  describe('getSectionDefaults', () => {
    it('should return defaults for hero section', () => {
      const defaults = getSectionDefaults('hero');
      // Defaults are parsed from Zod schema or empty
      expect(defaults).toBeDefined();
      expect(typeof defaults).toBe('object');
    });

    it('should return defaults for slideshow section', () => {
      const defaults = getSectionDefaults('slideshow');
      expect(defaults).toBeDefined();
      expect(typeof defaults).toBe('object');
    });

    it('should return defaults for featured-products section', () => {
      const defaults = getSectionDefaults('featured-products');
      expect(defaults).toBeDefined();
      expect(typeof defaults).toBe('object');
    });

    it('should return empty object for unknown section', () => {
      const defaults = getSectionDefaults('unknown-section');
      expect(defaults).toEqual({});
    });
  });

  describe('validateSection', () => {
    it('should validate valid hero section', () => {
      const result = validateSection('hero', {
        heading: 'Welcome',
        subheading: 'Shop now',
        buttonText: 'Shop',
        textAlignment: 'center',
        minHeight: 'medium',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate hero with long heading (max 100)', () => {
      const result = validateSection('hero', {
        heading: 'A'.repeat(101), // Over 100 chars
      });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should validate slideshow settings', () => {
      const validResult = validateSection('slideshow', { interval: 5 });
      expect(validResult.success).toBe(true);
      expect(validResult.data).toBeDefined();
    });

    it('should validate featured-products settings', () => {
      const validResult = validateSection('featured-products', { columns: 4 });
      expect(validResult.success).toBe(true);
      expect(validResult.data).toBeDefined();
    });

    it('should pass unknown section types (no validation)', () => {
      const result = validateSection('unknown-type', { anything: 'goes' });
      expect(result.success).toBe(true);
    });
  });

  describe('getSectionDefinition', () => {
    it('should return definition for hero section', () => {
      const def = getSectionDefinition('hero');
      expect(def).toBeDefined();
      expect(def?.name).toBe('Hero Banner');
      expect(def?.settings).toBeDefined();
    });

    it('should return undefined for unknown section', () => {
      const def = getSectionDefinition('non-existent');
      expect(def).toBeUndefined();
    });
  });

  describe('getSectionsWithBlocks', () => {
    it('should return sections that support blocks', () => {
      const sectionsWithBlocks = getSectionsWithBlocks();
      expect(sectionsWithBlocks).toContain('slideshow');
      expect(sectionsWithBlocks).toContain('featured-products');
      expect(sectionsWithBlocks).toContain('collection-list');
      expect(sectionsWithBlocks).toContain('testimonials');
      expect(sectionsWithBlocks).toContain('faq');
      // hero, rich-text, newsletter don't have blocks
      expect(sectionsWithBlocks).not.toContain('hero');
      expect(sectionsWithBlocks).not.toContain('newsletter');
    });
  });

  describe('getAllowedBlocks', () => {
    it('should return allowed blocks for slideshow', () => {
      const blocks = getAllowedBlocks('slideshow');
      expect(blocks).toContain('slide');
    });

    it('should return allowed blocks for testimonials', () => {
      const blocks = getAllowedBlocks('testimonials');
      expect(blocks).toContain('testimonial');
    });

    it('should return allowed blocks for faq', () => {
      const blocks = getAllowedBlocks('faq');
      expect(blocks).toContain('faq');
    });

    it('should return empty array for section without blocks', () => {
      const blocks = getAllowedBlocks('hero');
      expect(blocks).toEqual([]);
    });
  });

  describe('getMaxBlocks', () => {
    it('should return max blocks for slideshow', () => {
      expect(getMaxBlocks('slideshow')).toBe(10);
    });

    it('should return max blocks for collection-list', () => {
      expect(getMaxBlocks('collection-list')).toBe(12);
    });

    it('should return max blocks for testimonials', () => {
      expect(getMaxBlocks('testimonials')).toBe(10);
    });

    it('should return max blocks for faq', () => {
      expect(getMaxBlocks('faq')).toBe(20);
    });

    it('should return undefined for section without max', () => {
      expect(getMaxBlocks('hero')).toBeUndefined();
    });
  });
});
