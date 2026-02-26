/**
 * Page Builder — Templates Unit Tests
 *
 * Tests for:
 * - getAllBuilderTemplates()
 * - getBuilderTemplateById()
 * - BUILDER_TEMPLATES registry
 * - Template shape & section validity
 */

import { describe, it, expect } from 'vitest';
import {
  getAllBuilderTemplates,
  getBuilderTemplateById,
  getBuilderTemplatesByGoal,
  BUILDER_TEMPLATES,
} from '~/lib/page-builder/templates';
import { isValidSectionType } from '~/lib/page-builder/registry';

// ─── getAllBuilderTemplates ────────────────────────────────────────────────────

describe('getAllBuilderTemplates()', () => {
  it('returns exactly 6 templates', () => {
    const templates = getAllBuilderTemplates();
    expect(templates).toHaveLength(6);
  });

  it('returns an array (not null or undefined)', () => {
    const templates = getAllBuilderTemplates();
    expect(Array.isArray(templates)).toBe(true);
  });

  it('covers the 6 expected industries: general, fashion, food, tech, services, beauty', () => {
    const templates = getAllBuilderTemplates();
    const ids = templates.map((t) => t.id);
    expect(ids).toContain('general');
    expect(ids).toContain('fashion');
    expect(ids).toContain('food');
    expect(ids).toContain('tech');
    expect(ids).toContain('services');
    expect(ids).toContain('beauty');
  });

  it('every template has required top-level fields', () => {
    const requiredFields = [
      'id',
      'name',
      'nameBn',
      'industry',
      'description',
      'descriptionBn',
      'primaryColor',
      'accentColor',
      'conversionScore',
      'goal',
      'defaultSections',
    ] as const;

    const templates = getAllBuilderTemplates();
    for (const template of templates) {
      for (const field of requiredFields) {
        expect(
          template[field],
          `Field "${field}" missing on template "${template.id}"`
        ).toBeDefined();
      }
    }
  });

  it('every template has a non-empty nameBn (Bengali name)', () => {
    const templates = getAllBuilderTemplates();
    for (const template of templates) {
      expect(
        template.nameBn.length,
        `nameBn is empty for template "${template.id}"`
      ).toBeGreaterThan(0);
    }
  });

  it('every template primaryColor is a valid hex color', () => {
    const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    const templates = getAllBuilderTemplates();
    for (const template of templates) {
      expect(
        hexColorRegex.test(template.primaryColor),
        `primaryColor "${template.primaryColor}" on template "${template.id}" is not a valid hex`
      ).toBe(true);
    }
  });

  it('every template accentColor is a valid hex color', () => {
    const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    const templates = getAllBuilderTemplates();
    for (const template of templates) {
      expect(
        hexColorRegex.test(template.accentColor),
        `accentColor "${template.accentColor}" on template "${template.id}" is not a valid hex`
      ).toBe(true);
    }
  });

  it('every template has a defaultSections array with at least 1 section', () => {
    const templates = getAllBuilderTemplates();
    for (const template of templates) {
      expect(
        Array.isArray(template.defaultSections),
        `defaultSections should be array for "${template.id}"`
      ).toBe(true);
      expect(
        template.defaultSections.length,
        `defaultSections empty for template "${template.id}"`
      ).toBeGreaterThan(0);
    }
  });

  it('every template has a numeric conversionScore between 1 and 10', () => {
    const templates = getAllBuilderTemplates();
    for (const template of templates) {
      expect(typeof template.conversionScore).toBe('number');
      expect(template.conversionScore).toBeGreaterThanOrEqual(1);
      expect(template.conversionScore).toBeLessThanOrEqual(10);
    }
  });

  it('every template goal is one of the valid TemplateGoal values', () => {
    const validGoals = ['sales', 'leads', 'branding', 'restaurant'];
    const templates = getAllBuilderTemplates();
    for (const template of templates) {
      expect(
        validGoals,
        `goal "${template.goal}" on template "${template.id}" is not valid`
      ).toContain(template.goal);
    }
  });
});

// ─── getBuilderTemplateById ───────────────────────────────────────────────────

describe('getBuilderTemplateById()', () => {
  it('returns the "general" template by id', () => {
    const template = getBuilderTemplateById('general');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('general');
    expect(template?.name).toBe('General Store');
  });

  it('returns the "fashion" template by id', () => {
    const template = getBuilderTemplateById('fashion');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('fashion');
    expect(template?.name).toBe('Fashion Boutique');
    expect(template?.primaryColor).toBe('#EC4899');
  });

  it('returns the "food" template by id', () => {
    const template = getBuilderTemplateById('food');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('food');
    expect(template?.goal).toBe('restaurant');
  });

  it('returns the "tech" template by id', () => {
    const template = getBuilderTemplateById('tech');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('tech');
    expect(template?.primaryColor).toBe('#06B6D4');
  });

  it('returns the "services" template by id', () => {
    const template = getBuilderTemplateById('services');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('services');
    expect(template?.goal).toBe('leads');
  });

  it('returns the "beauty" template by id', () => {
    const template = getBuilderTemplateById('beauty');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('beauty');
    expect(template?.primaryColor).toBe('#F472B6');
  });

  it('returns null for a nonexistent template id', () => {
    expect(getBuilderTemplateById('nonexistent')).toBeNull();
  });

  it('returns null for empty string id', () => {
    expect(getBuilderTemplateById('')).toBeNull();
  });

  it('returns null for id with wrong case', () => {
    expect(getBuilderTemplateById('Fashion')).toBeNull();
    expect(getBuilderTemplateById('GENERAL')).toBeNull();
  });
});

// ─── Template defaultSections validity ───────────────────────────────────────

describe('Template defaultSections', () => {
  it('every section in every template has a valid section type in the registry', () => {
    const templates = getAllBuilderTemplates();
    for (const template of templates) {
      for (const section of template.defaultSections) {
        expect(
          isValidSectionType(section.type),
          `Section type "${section.type}" in template "${template.id}" is not valid`
        ).toBe(true);
      }
    }
  });

  it('every section has a position number', () => {
    const templates = getAllBuilderTemplates();
    for (const template of templates) {
      for (const section of template.defaultSections) {
        expect(
          typeof section.position,
          `position missing on section "${section.type}" of template "${template.id}"`
        ).toBe('number');
      }
    }
  });

  it('every section has a variant string', () => {
    const templates = getAllBuilderTemplates();
    for (const template of templates) {
      for (const section of template.defaultSections) {
        expect(
          typeof section.variant,
          `variant missing on section "${section.type}" of template "${template.id}"`
        ).toBe('string');
      }
    }
  });

  it('every section has defaultProps as an object', () => {
    const templates = getAllBuilderTemplates();
    for (const template of templates) {
      for (const section of template.defaultSections) {
        expect(
          typeof section.defaultProps,
          `defaultProps not an object for "${section.type}" in template "${template.id}"`
        ).toBe('object');
        expect(section.defaultProps).not.toBeNull();
      }
    }
  });

  it('sections are ordered by position (ascending)', () => {
    const templates = getAllBuilderTemplates();
    for (const template of templates) {
      const positions = template.defaultSections.map((s) => s.position);
      const sorted = [...positions].sort((a, b) => a - b);
      expect(positions).toEqual(sorted);
    }
  });

  it('"general" template starts with "hero" section at position 0', () => {
    const template = getBuilderTemplateById('general');
    const firstSection = template?.defaultSections[0];
    expect(firstSection?.type).toBe('hero');
    expect(firstSection?.position).toBe(0);
  });

  it('"general" template ends with "cta" section', () => {
    const template = getBuilderTemplateById('general');
    const sections = template!.defaultSections;
    const lastSection = sections[sections.length - 1];
    expect(lastSection?.type).toBe('cta');
  });

  it('"fashion" template includes a "gallery" section', () => {
    const template = getBuilderTemplateById('fashion');
    const types = template!.defaultSections.map((s) => s.type);
    expect(types).toContain('gallery');
  });

  it('"food" template includes "contact" section', () => {
    const template = getBuilderTemplateById('food');
    const types = template!.defaultSections.map((s) => s.type);
    expect(types).toContain('contact');
  });

  it('"services" template goal is "leads" and includes "contact" section', () => {
    const template = getBuilderTemplateById('services');
    expect(template?.goal).toBe('leads');
    const types = template!.defaultSections.map((s) => s.type);
    expect(types).toContain('contact');
  });

  it('"general" hero defaultProps contain Bengali headline', () => {
    const template = getBuilderTemplateById('general');
    const hero = template!.defaultSections.find((s) => s.type === 'hero');
    expect(hero?.defaultProps.headline).toBeTruthy();
    expect(typeof hero?.defaultProps.headline).toBe('string');
  });
});

// ─── BUILDER_TEMPLATES registry ──────────────────────────────────────────────

describe('BUILDER_TEMPLATES registry', () => {
  it('is a plain object (not an array)', () => {
    expect(typeof BUILDER_TEMPLATES).toBe('object');
    expect(Array.isArray(BUILDER_TEMPLATES)).toBe(false);
  });

  it('has exactly 6 keys', () => {
    expect(Object.keys(BUILDER_TEMPLATES)).toHaveLength(6);
  });

  it('each key matches the template id inside it', () => {
    for (const [key, template] of Object.entries(BUILDER_TEMPLATES)) {
      expect(template.id).toBe(key);
    }
  });
});

// ─── getBuilderTemplatesByGoal ────────────────────────────────────────────────

describe('getBuilderTemplatesByGoal()', () => {
  it('returns only templates with goal "sales"', () => {
    const salesTemplates = getBuilderTemplatesByGoal('sales');
    expect(salesTemplates.length).toBeGreaterThan(0);
    for (const t of salesTemplates) {
      expect(t.goal).toBe('sales');
    }
  });

  it('returns only templates with goal "leads"', () => {
    const leadsTemplates = getBuilderTemplatesByGoal('leads');
    expect(leadsTemplates.length).toBeGreaterThan(0);
    for (const t of leadsTemplates) {
      expect(t.goal).toBe('leads');
    }
  });

  it('returns only templates with goal "restaurant"', () => {
    const restaurantTemplates = getBuilderTemplatesByGoal('restaurant');
    expect(restaurantTemplates.length).toBeGreaterThan(0);
    for (const t of restaurantTemplates) {
      expect(t.goal).toBe('restaurant');
    }
  });

  it('"services" template appears in leads results', () => {
    const leadsTemplates = getBuilderTemplatesByGoal('leads');
    const ids = leadsTemplates.map((t) => t.id);
    expect(ids).toContain('services');
  });

  it('"food" template appears in restaurant results', () => {
    const restaurantTemplates = getBuilderTemplatesByGoal('restaurant');
    const ids = restaurantTemplates.map((t) => t.id);
    expect(ids).toContain('food');
  });

  it('returns empty array for unused goal "branding"', () => {
    const brandingTemplates = getBuilderTemplatesByGoal('branding');
    expect(brandingTemplates).toEqual([]);
  });

  it('sales + leads + restaurant counts add up to 6 total templates', () => {
    const sales = getBuilderTemplatesByGoal('sales').length;
    const leads = getBuilderTemplatesByGoal('leads').length;
    const restaurant = getBuilderTemplatesByGoal('restaurant').length;
    const branding = getBuilderTemplatesByGoal('branding').length;
    expect(sales + leads + restaurant + branding).toBe(6);
  });
});
