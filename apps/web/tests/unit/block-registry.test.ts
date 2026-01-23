/**
 * Block Registry Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  BLOCK_REGISTRY,
  BLOCK_SCHEMA_MAP,
  getBlockDefaults,
  validateBlock,
  createBlock,
  getBlockDefinition,
  getAvailableBlockTypes,
} from '~/lib/block-registry';

describe('Block Registry', () => {
  describe('BLOCK_REGISTRY', () => {
    it('should have 9 block types defined', () => {
      const blockTypes = Object.keys(BLOCK_REGISTRY);
      expect(blockTypes.length).toBe(9);
      expect(blockTypes).toContain('button');
      expect(blockTypes).toContain('text');
      expect(blockTypes).toContain('image');
      expect(blockTypes).toContain('slide');
      expect(blockTypes).toContain('feature');
      expect(blockTypes).toContain('testimonial');
      expect(blockTypes).toContain('faq');
      expect(blockTypes).toContain('product');
      expect(blockTypes).toContain('collection');
    });

    it('should have valid structure for each block', () => {
      Object.entries(BLOCK_REGISTRY).forEach(([type, def]) => {
        expect(def.type).toBe(type);
        expect(def.name).toBeDefined();
        expect(Array.isArray(def.settings)).toBe(true);
      });
    });

    it('should have limits defined for specific blocks', () => {
      expect(BLOCK_REGISTRY.slide.limit).toBe(10);
      expect(BLOCK_REGISTRY.feature.limit).toBe(12);
      expect(BLOCK_REGISTRY.testimonial.limit).toBe(10);
      expect(BLOCK_REGISTRY.faq.limit).toBe(20);
    });
  });

  describe('getBlockDefaults', () => {
    it('should return defaults for button block', () => {
      const defaults = getBlockDefaults('button');
      expect(defaults.text).toBe('Click Me');
      expect(defaults.style).toBe('primary');
      expect(defaults.size).toBe('md');
      expect(defaults.openInNewTab).toBe(false);
    });

    it('should return defaults for slide block', () => {
      const defaults = getBlockDefaults('slide');
      expect(defaults.textPosition).toBe('center');
      expect(defaults.overlayOpacity).toBe(40);
    });

    it('should return empty object for unknown block', () => {
      const defaults = getBlockDefaults('unknown-block');
      expect(defaults).toEqual({});
    });
  });

  describe('validateBlock', () => {
    it('should validate valid button block', () => {
      const result = validateBlock('button', {
        text: 'Click Me',
        link: 'https://example.com',
        style: 'primary',
        size: 'md',
        openInNewTab: false,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should fail for invalid button style', () => {
      const result = validateBlock('button', {
        text: 'Click Me',
        style: 'invalid-style',
      });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should fail for unknown block type', () => {
      const result = validateBlock('unknown', {});
      expect(result.success).toBe(false);
      expect(result.errors?.[0].message).toContain('Unknown block type');
    });

    it('should validate testimonial with rating', () => {
      const result = validateBlock('testimonial', {
        quote: 'Great product!',
        author: 'John Doe',
        rating: 5,
      });
      expect(result.success).toBe(true);
    });

    it('should fail for rating out of range', () => {
      const result = validateBlock('testimonial', {
        rating: 10, // Max is 5
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createBlock', () => {
    it('should create block with default settings', () => {
      const block = createBlock('button');
      expect(block.id).toBeDefined();
      expect(block.type).toBe('button');
      expect(block.settings.text).toBe('Click Me');
    });

    it('should create block with custom id', () => {
      const block = createBlock('text', 'custom-id-123');
      expect(block.id).toBe('custom-id-123');
      expect(block.type).toBe('text');
    });
  });

  describe('getBlockDefinition', () => {
    it('should return definition for valid block', () => {
      const def = getBlockDefinition('button');
      expect(def).toBeDefined();
      expect(def?.name).toBe('Button');
    });

    it('should return undefined for invalid block', () => {
      const def = getBlockDefinition('non-existent');
      expect(def).toBeUndefined();
    });
  });

  describe('getAvailableBlockTypes', () => {
    it('should return all block types', () => {
      const types = getAvailableBlockTypes();
      expect(types.length).toBe(9);
      expect(types).toContain('button');
    });
  });
});
