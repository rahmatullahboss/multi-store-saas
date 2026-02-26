/**
 * Page Builder — Section Registry Unit Tests
 *
 * Tests for:
 * - isValidSectionType()
 * - getSectionMeta()
 * - AVAILABLE_SECTIONS
 * - SECTION_REGISTRY completeness
 */

import { describe, it, expect } from 'vitest';
import {
  SECTION_REGISTRY,
  AVAILABLE_SECTIONS,
  isValidSectionType,
  getSectionMeta,
  getDefaultProps,
  getAllSectionTypes,
  DEFAULT_SECTION_ORDER,
} from '~/lib/page-builder/registry';
import type { SectionType } from '~/lib/page-builder/types';

// ─── isValidSectionType ───────────────────────────────────────────────────────

describe('isValidSectionType()', () => {
  it('returns true for all core section types', () => {
    const coreSections: string[] = [
      'hero',
      'features',
      'testimonials',
      'faq',
      'gallery',
      'video',
      'cta',
      'trust-badges',
      'benefits',
      'comparison',
      'delivery',
      'guarantee',
      'problem-solution',
      'pricing',
      'how-to-order',
      'showcase',
      'product-grid',
      'custom-html',
      'order-button',
      'header',
      'countdown',
      'stats',
      'contact',
      'footer',
    ];

    for (const type of coreSections) {
      expect(isValidSectionType(type), `Expected "${type}" to be valid`).toBe(true);
    }
  });

  it('returns true for alias section types', () => {
    expect(isValidSectionType('trust')).toBe(true);
    expect(isValidSectionType('social')).toBe(true);
    expect(isValidSectionType('social-proof')).toBe(true);
    expect(isValidSectionType('newsletter')).toBe(true);
    expect(isValidSectionType('order-form')).toBe(true);
  });

  it('returns true for product page section types', () => {
    expect(isValidSectionType('product-header')).toBe(true);
    expect(isValidSectionType('product-gallery')).toBe(true);
    expect(isValidSectionType('product-info')).toBe(true);
    expect(isValidSectionType('product-description')).toBe(true);
    expect(isValidSectionType('related-products')).toBe(true);
  });

  it('returns true for cart page section types', () => {
    expect(isValidSectionType('cart-items')).toBe(true);
    expect(isValidSectionType('cart-summary')).toBe(true);
  });

  it('returns true for collection and misc section types', () => {
    expect(isValidSectionType('collection-header')).toBe(true);
    expect(isValidSectionType('rich-text')).toBe(true);
  });

  it('returns false for completely invalid section types', () => {
    expect(isValidSectionType('')).toBe(false);
    expect(isValidSectionType('unknown')).toBe(false);
    expect(isValidSectionType('HERO')).toBe(false);
    expect(isValidSectionType('Hero')).toBe(false);
    expect(isValidSectionType('nonexistent-section')).toBe(false);
  });

  it('returns false for null-ish string values', () => {
    expect(isValidSectionType('null')).toBe(false);
    expect(isValidSectionType('undefined')).toBe(false);
    expect(isValidSectionType(' ')).toBe(false);
  });

  it('acts as a type-guard (TypeScript narrowing)', () => {
    const type: string = 'hero';
    if (isValidSectionType(type)) {
      // Inside the if-block, `type` is narrowed to `SectionType`
      const sectionType: SectionType = type;
      expect(sectionType).toBe('hero');
    }
  });
});

// ─── getSectionMeta ───────────────────────────────────────────────────────────

describe('getSectionMeta()', () => {
  it('returns correct meta for "hero" section', () => {
    const meta = getSectionMeta('hero');
    expect(meta).not.toBeNull();
    expect(meta?.type).toBe('hero');
    expect(meta?.name).toBe('হিরো');
    expect(meta?.nameEn).toBe('Hero');
    expect(meta?.icon).toBe('Type');
    expect(typeof meta?.description).toBe('string');
    expect(typeof meta?.descriptionEn).toBe('string');
  });

  it('returns correct meta for "features" section', () => {
    const meta = getSectionMeta('features');
    expect(meta).not.toBeNull();
    expect(meta?.type).toBe('features');
    expect(meta?.nameEn).toBe('Features');
    expect(meta?.icon).toBe('Star');
  });

  it('returns correct meta for "cta" section', () => {
    const meta = getSectionMeta('cta');
    expect(meta).not.toBeNull();
    expect(meta?.type).toBe('cta');
    expect(meta?.nameEn).toBe('Order Form');
    expect(meta?.icon).toBe('ShoppingCart');
  });

  it('returns correct meta for "trust-badges" section', () => {
    const meta = getSectionMeta('trust-badges');
    expect(meta).not.toBeNull();
    expect(meta?.type).toBe('trust-badges');
    expect(meta?.nameEn).toBe('Trust Badges');
    expect(meta?.icon).toBe('ShieldCheck');
  });

  it('returns correct meta for "faq" section', () => {
    const meta = getSectionMeta('faq');
    expect(meta).not.toBeNull();
    expect(meta?.nameEn).toBe('FAQ');
    expect(meta?.icon).toBe('HelpCircle');
  });

  it('returns correct meta for "footer" section', () => {
    const meta = getSectionMeta('footer');
    expect(meta).not.toBeNull();
    expect(meta?.nameEn).toBe('Footer');
  });

  it('returns correct meta for "countdown" section', () => {
    const meta = getSectionMeta('countdown');
    expect(meta).not.toBeNull();
    expect(meta?.nameEn).toBe('Countdown Timer');
    expect(meta?.icon).toBe('Timer');
  });

  it('returns correct meta for "stats" section', () => {
    const meta = getSectionMeta('stats');
    expect(meta).not.toBeNull();
    expect(meta?.nameEn).toBe('Stats Counter');
    expect(meta?.icon).toBe('BarChart3');
  });

  it('returns meta with all required fields present', () => {
    const requiredFields: Array<keyof NonNullable<ReturnType<typeof getSectionMeta>>> = [
      'type',
      'name',
      'nameEn',
      'description',
      'descriptionEn',
      'icon',
    ];

    const allTypes = getAllSectionTypes();
    for (const type of allTypes) {
      const meta = getSectionMeta(type);
      expect(meta, `Meta for "${type}" should not be null`).not.toBeNull();
      for (const field of requiredFields) {
        expect(
          meta?.[field],
          `Field "${field}" missing on section "${type}"`
        ).toBeDefined();
      }
    }
  });

  it('returns null for unknown section type', () => {
    expect(getSectionMeta('does-not-exist')).toBeNull();
    expect(getSectionMeta('')).toBeNull();
    expect(getSectionMeta('HERO')).toBeNull();
  });

  it('does NOT expose the schema or defaultProps in meta (only metadata)', () => {
    const meta = getSectionMeta('hero');
    expect(meta).not.toHaveProperty('schema');
    expect(meta).not.toHaveProperty('defaultProps');
  });
});

// ─── AVAILABLE_SECTIONS ───────────────────────────────────────────────────────

describe('AVAILABLE_SECTIONS', () => {
  it('has at least 10 sections', () => {
    expect(AVAILABLE_SECTIONS.length).toBeGreaterThanOrEqual(10);
  });

  it('every entry has required fields: type, name, nameEn, icon, description, descriptionEn', () => {
    for (const section of AVAILABLE_SECTIONS) {
      expect(section.type, `type missing on section: ${JSON.stringify(section)}`).toBeTruthy();
      expect(section.name, `name missing on section "${section.type}"`).toBeTruthy();
      expect(section.nameEn, `nameEn missing on section "${section.type}"`).toBeTruthy();
      expect(section.icon, `icon missing on section "${section.type}"`).toBeTruthy();
      expect(typeof section.description).toBe('string');
      expect(typeof section.descriptionEn).toBe('string');
    }
  });

  it('includes all core section types', () => {
    const availableTypes = AVAILABLE_SECTIONS.map((s) => s.type);
    const coreSections = [
      'hero',
      'features',
      'testimonials',
      'faq',
      'cta',
      'trust-badges',
      'benefits',
      'footer',
    ];
    for (const type of coreSections) {
      expect(availableTypes, `"${type}" should be in AVAILABLE_SECTIONS`).toContain(type);
    }
  });

  it('matches getAllSectionTypes() length', () => {
    expect(AVAILABLE_SECTIONS.length).toBe(getAllSectionTypes().length);
  });

  it('every section type in AVAILABLE_SECTIONS passes isValidSectionType()', () => {
    for (const section of AVAILABLE_SECTIONS) {
      expect(
        isValidSectionType(section.type),
        `"${section.type}" should pass isValidSectionType()`
      ).toBe(true);
    }
  });
});

// ─── SECTION_REGISTRY ─────────────────────────────────────────────────────────

describe('SECTION_REGISTRY', () => {
  it('contains at least 10 section entries', () => {
    expect(Object.keys(SECTION_REGISTRY).length).toBeGreaterThanOrEqual(10);
  });

  it('every entry has a schema (ZodType)', () => {
    for (const [type, entry] of Object.entries(SECTION_REGISTRY)) {
      expect(entry.schema, `Schema missing for "${type}"`).toBeDefined();
      expect(typeof entry.schema.parse).toBe('function');
    }
  });

  it('every entry has defaultProps that are valid objects', () => {
    for (const [type, entry] of Object.entries(SECTION_REGISTRY)) {
      expect(
        typeof entry.defaultProps,
        `defaultProps for "${type}" should be an object`
      ).toBe('object');
    }
  });

  it('every schema can parse an empty object and return defaults', () => {
    // Schemas use Zod .default(), so parsing {} should not throw
    const schemasThatSupportEmptyParse = [
      'hero', 'features', 'testimonials', 'faq', 'gallery', 'video',
      'cta', 'trust-badges', 'benefits', 'comparison', 'delivery',
      'guarantee', 'problem-solution', 'pricing', 'how-to-order', 'showcase',
      'product-grid', 'custom-html', 'order-button', 'header', 'countdown',
      'stats', 'contact', 'footer',
    ];

    for (const type of schemasThatSupportEmptyParse) {
      const entry = SECTION_REGISTRY[type as SectionType];
      if (!entry) continue;
      expect(
        () => entry.schema.parse({}),
        `Schema for "${type}" should parse {} without throwing`
      ).not.toThrow();
    }
  });

  it('"hero" registry entry has correct type and icon', () => {
    const hero = SECTION_REGISTRY['hero'];
    expect(hero.type).toBe('hero');
    expect(hero.icon).toBe('Type');
    expect(hero.nameEn).toBe('Hero');
  });

  it('"trust" alias entry has type "trust-badges"', () => {
    // 'trust' is a registry alias that maps to type 'trust-badges'
    const trust = SECTION_REGISTRY['trust'];
    expect(trust).toBeDefined();
    expect(trust.type).toBe('trust-badges');
  });

  it('"social" alias entry has type "social-proof"', () => {
    const social = SECTION_REGISTRY['social'];
    expect(social).toBeDefined();
    expect(social.type).toBe('social-proof');
  });
});

// ─── getDefaultProps ──────────────────────────────────────────────────────────

describe('getDefaultProps()', () => {
  it('returns an object for known section types', () => {
    expect(typeof getDefaultProps('hero')).toBe('object');
    expect(typeof getDefaultProps('features')).toBe('object');
    expect(typeof getDefaultProps('faq')).toBe('object');
    expect(typeof getDefaultProps('cta')).toBe('object');
  });

  it('returns an empty object for unknown section types', () => {
    expect(getDefaultProps('unknown-type')).toEqual({});
  });

  it('hero defaults include a headline string', () => {
    const defaults = getDefaultProps('hero');
    expect(typeof defaults.headline).toBe('string');
    expect((defaults.headline as string).length).toBeGreaterThan(0);
  });

  it('features defaults include a features array', () => {
    const defaults = getDefaultProps('features');
    expect(Array.isArray(defaults.features)).toBe(true);
  });
});

// ─── DEFAULT_SECTION_ORDER ────────────────────────────────────────────────────

describe('DEFAULT_SECTION_ORDER', () => {
  it('is an array with at least 5 entries', () => {
    expect(Array.isArray(DEFAULT_SECTION_ORDER)).toBe(true);
    expect(DEFAULT_SECTION_ORDER.length).toBeGreaterThanOrEqual(5);
  });

  it('starts with "hero"', () => {
    expect(DEFAULT_SECTION_ORDER[0]).toBe('hero');
  });

  it('ends with "cta"', () => {
    expect(DEFAULT_SECTION_ORDER[DEFAULT_SECTION_ORDER.length - 1]).toBe('cta');
  });

  it('every type in DEFAULT_SECTION_ORDER is a valid section type', () => {
    for (const type of DEFAULT_SECTION_ORDER) {
      expect(
        isValidSectionType(type),
        `"${type}" in DEFAULT_SECTION_ORDER should be valid`
      ).toBe(true);
    }
  });

  it('contains core e-commerce sections', () => {
    expect(DEFAULT_SECTION_ORDER).toContain('hero');
    expect(DEFAULT_SECTION_ORDER).toContain('features');
    expect(DEFAULT_SECTION_ORDER).toContain('testimonials');
    expect(DEFAULT_SECTION_ORDER).toContain('faq');
    expect(DEFAULT_SECTION_ORDER).toContain('cta');
  });
});
