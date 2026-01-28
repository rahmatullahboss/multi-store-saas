/**
 * Theme Bridge - Connects Shopify OS 2.0 Themes with LiveEditor
 *
 * This adapter bridges the gap between the new theme structure
 * and the LiveEditor component. It provides theme loading,
 * section registry access, and template format conversion.
 */

import type {
  SectionRegistry,
  TemplateJSON,
  SectionInstance,
  SectionSchema,
  BlockInstance,
  ThemeConfig,
  SectionComponentProps,
} from '~/lib/theme-engine/types';

import type { ComponentType } from 'react';

// Import the starter-store theme
import StarterStoreTheme, { SECTIONS as StarterStoreSections } from '~/themes/starter-store';
import DarazTheme, { SECTIONS as DarazSections } from '~/themes/daraz';
import BDShopTheme, { SECTIONS as BDShopSections } from '~/themes/bdshop';
import GhorerBazarTheme, { SECTIONS as GhorerBazarSections } from '~/themes/ghorer-bazar';
import LuxeBoutiqueTheme, { SECTIONS as LuxeBoutiqueSections } from '~/themes/luxe-boutique';
import TechModernTheme, { SECTIONS as TechModernSections } from '~/themes/tech-modern';

// Static template imports (Bug #5 fix - dynamic imports don't work in bundled environments)
import starterStoreIndexTemplate from '~/themes/starter-store/templates/index.json';
import starterStoreProductTemplate from '~/themes/starter-store/templates/product.json';
import starterStoreCollectionTemplate from '~/themes/starter-store/templates/collection.json';
import starterStoreCartTemplate from '~/themes/starter-store/templates/cart.json';
import starterStorePageTemplate from '~/themes/starter-store/templates/page.json';

import darazIndexTemplate from '~/themes/daraz/templates/index.json';
import darazProductTemplate from '~/themes/daraz/templates/product.json';
import darazCollectionTemplate from '~/themes/daraz/templates/collection.json';
import darazCartTemplate from '~/themes/daraz/templates/cart.json';
import darazPageTemplate from '~/themes/daraz/templates/page.json';

import bdshopIndexTemplate from '~/themes/bdshop/templates/index.json';
import bdshopProductTemplate from '~/themes/bdshop/templates/product.json';
import bdshopCollectionTemplate from '~/themes/bdshop/templates/collection.json';
import bdshopCartTemplate from '~/themes/bdshop/templates/cart.json';
import bdshopPageTemplate from '~/themes/bdshop/templates/page.json';

import ghorerBazarIndexTemplate from '~/themes/ghorer-bazar/templates/index.json';
import ghorerBazarProductTemplate from '~/themes/ghorer-bazar/templates/product.json';
import ghorerBazarCollectionTemplate from '~/themes/ghorer-bazar/templates/collection.json';
import ghorerBazarCartTemplate from '~/themes/ghorer-bazar/templates/cart.json';
import ghorerBazarPageTemplate from '~/themes/ghorer-bazar/templates/page.json';

import luxeBoutiqueIndexTemplate from '~/themes/luxe-boutique/templates/index.json';

import techModernIndexTemplate from '~/themes/tech-modern/templates/index.json';

// ============================================================================
// TYPES
// ============================================================================

export interface ThemeMetadata {
  id: string;
  name: string;
  nameBn?: string;
  version: string;
  author: string;
  description: string;
  descriptionBn?: string;
  previewImage?: string;
  features?: string[];
  templates?: string[];
  categories?: string[];
}

export interface LoadedTheme {
  metadata: ThemeMetadata;
  config: ThemeConfig;
  sections: SectionRegistry;
}

export interface EditorSection {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  blocks?: BlockInstance[];
}

// ============================================================================
// THEME REGISTRY
// ============================================================================

/**
 * Registry of all available themes.
 * Add new themes here as they are created.
 */
const THEME_REGISTRY: Record<string, LoadedTheme> = {
  'starter-store': {
    metadata: StarterStoreTheme.metadata,
    config: StarterStoreTheme.config,
    sections: StarterStoreSections,
  },
  daraz: {
    metadata: DarazTheme.metadata,
    config: DarazTheme.config,
    sections: DarazSections,
  },
  bdshop: {
    metadata: BDShopTheme.metadata,
    config: BDShopTheme.config,
    sections: BDShopSections,
  },
  'ghorer-bazar': {
    metadata: GhorerBazarTheme.metadata,
    config: GhorerBazarTheme.config,
    sections: GhorerBazarSections,
  },
  'luxe-boutique': {
    metadata: LuxeBoutiqueTheme.metadata,
    config: LuxeBoutiqueTheme.config,
    sections: LuxeBoutiqueSections,
  },
  'tech-modern': {
    metadata: TechModernTheme.metadata,
    config: TechModernTheme.config,
    sections: TechModernSections,
  },
};

// Aliases for legacy theme IDs - map to valid themes
const THEME_ALIASES: Record<string, string> = {
  default: 'starter-store',
  'modern-standard': 'starter-store',
  'classic-minimal': 'starter-store',
  'bold-marketplace': 'daraz',
};

// Default theme to use when an invalid theme ID is provided
const DEFAULT_THEME_ID = 'starter-store';

/**
 * Resolve a theme ID, handling aliases and invalid IDs
 */
function resolveThemeId(themeId: string): string {
  // Check direct match first
  if (THEME_REGISTRY[themeId]) {
    return themeId;
  }
  // Check aliases
  if (THEME_ALIASES[themeId] && THEME_REGISTRY[THEME_ALIASES[themeId]]) {
    return THEME_ALIASES[themeId];
  }
  // Fallback to default
  console.warn(`Unknown theme ID "${themeId}", falling back to "${DEFAULT_THEME_ID}"`);
  return DEFAULT_THEME_ID;
}

// ============================================================================
// STATIC TEMPLATE REGISTRY (Bug #5 fix)
// ============================================================================

/**
 * Static registry of all template JSON files.
 * Dynamic imports don't work reliably in bundled environments,
 * so we pre-import all templates statically.
 */
const TEMPLATE_REGISTRY: Record<string, Record<string, TemplateJSON>> = {
  'starter-store': {
    index: starterStoreIndexTemplate as unknown as TemplateJSON,
    product: starterStoreProductTemplate as unknown as TemplateJSON,
    collection: starterStoreCollectionTemplate as unknown as TemplateJSON,
    cart: starterStoreCartTemplate as unknown as TemplateJSON,
    page: starterStorePageTemplate as unknown as TemplateJSON,
  },
  daraz: {
    index: darazIndexTemplate as unknown as TemplateJSON,
    product: darazProductTemplate as unknown as TemplateJSON,
    collection: darazCollectionTemplate as unknown as TemplateJSON,
    cart: darazCartTemplate as unknown as TemplateJSON,
    page: darazPageTemplate as unknown as TemplateJSON,
  },
  bdshop: {
    index: bdshopIndexTemplate as unknown as TemplateJSON,
    product: bdshopProductTemplate as unknown as TemplateJSON,
    collection: bdshopCollectionTemplate as unknown as TemplateJSON,
    cart: bdshopCartTemplate as unknown as TemplateJSON,
    page: bdshopPageTemplate as unknown as TemplateJSON,
  },
  'ghorer-bazar': {
    index: ghorerBazarIndexTemplate as unknown as TemplateJSON,
    product: ghorerBazarProductTemplate as unknown as TemplateJSON,
    collection: ghorerBazarCollectionTemplate as unknown as TemplateJSON,
    cart: ghorerBazarCartTemplate as unknown as TemplateJSON,
    page: ghorerBazarPageTemplate as unknown as TemplateJSON,
  },
  'luxe-boutique': {
    index: luxeBoutiqueIndexTemplate as unknown as TemplateJSON,
    // Other templates use starter-store as fallback
  },
  'tech-modern': {
    index: techModernIndexTemplate as unknown as TemplateJSON,
    // Other templates use starter-store as fallback
  },
};

// ============================================================================
// THEME BRIDGE CLASS
// ============================================================================

export class ThemeBridge {
  private currentThemeId: string;
  private theme: LoadedTheme;

  constructor(themeId: string = 'starter-store') {
    // Resolve the theme ID (handles aliases and invalid IDs)
    this.currentThemeId = resolveThemeId(themeId);
    const theme = THEME_REGISTRY[this.currentThemeId];
    if (!theme) {
      // This should never happen after resolveThemeId, but just in case
      throw new Error(`Theme not found: ${themeId}`);
    }
    this.theme = theme;
  }

  // ============================================================================
  // THEME ACCESS
  // ============================================================================

  /**
   * Get all available themes
   */
  static getAvailableThemes(): ThemeMetadata[] {
    return Object.values(THEME_REGISTRY).map((t) => t.metadata);
  }

  /**
   * Get current theme metadata
   */
  getMetadata(): ThemeMetadata {
    return this.theme.metadata;
  }

  /**
   * Get current theme config
   */
  getConfig(): ThemeConfig {
    return this.theme.config;
  }

  /**
   * Get section registry for current theme
   */
  getSectionRegistry(): SectionRegistry {
    return this.theme.sections;
  }

  /**
   * Get a specific section's schema
   */
  getSectionSchema(sectionType: string): SectionSchema | null {
    const section = this.theme.sections[sectionType];
    return section?.schema || null;
  }

  /**
   * Get a specific section's component
   */
  getSectionComponent(sectionType: string): ComponentType<SectionComponentProps> | null {
    const section = this.theme.sections[sectionType];
    return section?.component || null;
  }

  // ============================================================================
  // TEMPLATE OPERATIONS
  // ============================================================================

  /**
   * Load a template from the static registry.
   * Uses pre-imported templates instead of dynamic imports.
   */
  async loadTemplate(templateType: string = 'index'): Promise<TemplateJSON | null> {
    // Get templates for current theme
    const themeTemplates = TEMPLATE_REGISTRY[this.currentThemeId];

    if (themeTemplates && themeTemplates[templateType]) {
      return themeTemplates[templateType];
    }

    // Fallback to starter-store templates if theme doesn't have this template
    const fallbackTemplates = TEMPLATE_REGISTRY['starter-store'];
    if (fallbackTemplates && fallbackTemplates[templateType]) {
      console.warn(
        `Template "${templateType}" not found for theme "${this.currentThemeId}", using starter-store fallback`
      );
      return fallbackTemplates[templateType];
    }

    console.warn(`Template "${templateType}" not found for theme "${this.currentThemeId}"`);
    return null;
  }

  /**
   * Synchronous version of loadTemplate for immediate access
   */
  getTemplate(templateType: string = 'index'): TemplateJSON | null {
    const themeTemplates = TEMPLATE_REGISTRY[this.currentThemeId];
    if (themeTemplates && themeTemplates[templateType]) {
      return themeTemplates[templateType];
    }
    // Fallback to starter-store
    const fallbackTemplates = TEMPLATE_REGISTRY['starter-store'];
    return fallbackTemplates?.[templateType] || null;
  }

  /**
   * Convert template JSON to editor sections array.
   * LiveEditor uses a flat array, but Shopify uses { sections: {}, order: [] }
   */
  templateToEditorSections(template: TemplateJSON): EditorSection[] {
    const sections: EditorSection[] = [];

    for (const sectionId of template.order) {
      const sectionData = template.sections[sectionId];
      if (sectionData) {
        sections.push({
          id: sectionId,
          type: sectionData.type,
          settings: sectionData.settings,
          blocks: sectionData.blocks,
        });
      }
    }

    return sections;
  }

  /**
   * Convert editor sections array back to template JSON format
   */
  editorSectionsToTemplate(sections: EditorSection[], templateName?: string): TemplateJSON {
    const templateSections: Record<string, SectionInstance> = {};
    const order: string[] = [];

    for (const section of sections) {
      templateSections[section.id] = {
        id: section.id,
        type: section.type,
        settings: section.settings,
        blocks: section.blocks,
        block_order: section.blocks?.map((b) => b.id),
      };
      order.push(section.id);
    }

    return {
      name: templateName,
      sections: templateSections,
      order,
    };
  }

  // ============================================================================
  // SECTION OPERATIONS
  // ============================================================================

  /**
   * Create a new section instance with defaults from schema
   */
  createSection(sectionType: string, presetName?: string): EditorSection | null {
    const schema = this.getSectionSchema(sectionType);
    if (!schema) return null;

    // Get default settings
    const settings: Record<string, unknown> = {};
    for (const setting of schema.settings) {
      if (setting.id && setting.default !== undefined) {
        settings[setting.id] = setting.default;
      }
    }

    // Apply preset if specified
    if (presetName && schema.presets) {
      const preset = schema.presets.find((p) => p.name === presetName);
      if (preset?.settings) {
        Object.assign(settings, preset.settings);
      }
    }

    // Create blocks from defaults
    let blocks: BlockInstance[] | undefined;
    if (schema.default?.blocks && schema.blocks) {
      blocks = schema.default.blocks.map((blockConfig, index) => {
        const blockDef = schema.blocks!.find((b) => b.type === blockConfig.type);
        const blockSettings: Record<string, unknown> = {};

        if (blockDef) {
          for (const setting of blockDef.settings) {
            if (setting.id && setting.default !== undefined) {
              blockSettings[setting.id] = setting.default;
            }
          }
        }

        return {
          id: `${blockConfig.type}-${index}-${Date.now()}`,
          type: blockConfig.type,
          settings: { ...blockSettings, ...blockConfig.settings },
        };
      });
    }

    return {
      id: `${sectionType}-${Date.now()}`,
      type: sectionType,
      settings,
      blocks,
    };
  }

  /**
   * Get available section types for adding
   */
  getAvailableSectionTypes(): Array<{
    type: string;
    name: string;
    presets?: Array<{ name: string; category?: string }>;
    limit?: number;
  }> {
    return Object.entries(this.theme.sections).map(([type, { schema }]) => ({
      type,
      name: schema.name,
      presets: schema.presets?.map((p) => ({ name: p.name, category: p.category })),
      limit: schema.limit,
    }));
  }

  /**
   * Validate a section's settings against its schema
   */
  validateSection(section: EditorSection): { valid: boolean; errors: string[] } {
    const schema = this.getSectionSchema(section.type);
    if (!schema) {
      return { valid: false, errors: [`Unknown section type: ${section.type}`] };
    }

    const errors: string[] = [];

    // Validate required settings
    for (const setting of schema.settings) {
      if (setting.type === 'header' || setting.type === 'paragraph') continue;

      const value = section.settings[setting.id];

      // Check for range constraints
      if (setting.type === 'range' || setting.type === 'number') {
        const numValue = value as number;
        if (setting.min !== undefined && numValue < setting.min) {
          errors.push(`${setting.label} must be at least ${setting.min}`);
        }
        if (setting.max !== undefined && numValue > setting.max) {
          errors.push(`${setting.label} must be at most ${setting.max}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // ============================================================================
  // BLOCK OPERATIONS
  // ============================================================================

  /**
   * Create a new block instance
   */
  createBlock(sectionType: string, blockType: string): BlockInstance | null {
    const schema = this.getSectionSchema(sectionType);
    if (!schema?.blocks) return null;

    const blockDef = schema.blocks.find((b) => b.type === blockType);
    if (!blockDef) return null;

    const settings: Record<string, unknown> = {};
    for (const setting of blockDef.settings) {
      if (setting.id && setting.default !== undefined) {
        settings[setting.id] = setting.default;
      }
    }

    return {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      settings,
    };
  }

  /**
   * Get available block types for a section
   */
  getAvailableBlockTypes(sectionType: string): Array<{
    type: string;
    name: string;
    limit?: number;
  }> {
    const schema = this.getSectionSchema(sectionType);
    if (!schema?.blocks) return [];

    return schema.blocks.map((block) => ({
      type: block.type,
      name: block.name,
      limit: block.limit,
    }));
  }

  /**
   * Get the current theme ID
   */
  getThemeId(): string {
    return this.currentThemeId;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let bridgeInstance: ThemeBridge | null = null;

/**
 * Get or create the theme bridge instance.
 * Always requires a themeId to ensure correct theme is used.
 */
export function getThemeBridge(themeId: string = 'starter-store'): ThemeBridge {
  // Resolve the theme ID first
  const resolvedId = resolveThemeId(themeId);

  // Create new instance if none exists or if theme changed
  if (!bridgeInstance || bridgeInstance.getThemeId() !== resolvedId) {
    bridgeInstance = new ThemeBridge(resolvedId);
  }
  return bridgeInstance;
}

/**
 * Create a fresh ThemeBridge instance (doesn't use singleton)
 * Use this when you need a separate instance for a specific theme
 */
export function createThemeBridge(themeId: string = 'starter-store'): ThemeBridge {
  return new ThemeBridge(themeId);
}

/**
 * Reset the theme bridge singleton (useful for theme switching)
 */
export function resetThemeBridge(): void {
  bridgeInstance = null;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ThemeBridge;
