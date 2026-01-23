/**
 * Theme Validation - Unified validation for sections and blocks
 * 
 * This module provides validation functions for the store editor,
 * ensuring data integrity before saving to draft tables.
 */

import { validateSection, getSectionDefaults, getSectionDefinition, getAllowedBlocks, getMaxBlocks } from './section-schemas';
import { validateBlock, getBlockDefaults, getBlockDefinition, type Block } from './block-registry';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationError {
  path: string;
  message: string;
  sectionId?: string;
  blockId?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface SectionWithBlocks {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  blocks?: Block[];
}

// ============================================================================
// SECTION VALIDATION
// ============================================================================

/**
 * Validate a single section with its blocks
 */
export function validateSectionWithBlocks(section: SectionWithBlocks): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate section settings
  const sectionResult = validateSection(section.type, section.settings);
  if (!sectionResult.success && sectionResult.errors) {
    errors.push(...sectionResult.errors.map(err => ({
      ...err,
      sectionId: section.id,
      path: `sections.${section.id}.settings.${err.path}`,
    })));
  }

  // Validate blocks if present
  if (section.blocks && section.blocks.length > 0) {
    const allowedBlocks = getAllowedBlocks(section.type);
    const maxBlocks = getMaxBlocks(section.type);

    // Check max blocks limit
    if (maxBlocks && section.blocks.length > maxBlocks) {
      errors.push({
        path: `sections.${section.id}.blocks`,
        message: `Maximum ${maxBlocks} blocks allowed, but ${section.blocks.length} provided`,
        sectionId: section.id,
      });
    }

    // Validate each block
    for (const block of section.blocks) {
      // If section doesn't support blocks, any block is invalid
      if (allowedBlocks.length === 0) {
        errors.push({
          path: `sections.${section.id}.blocks.${block.id}`,
          message: `Section "${section.type}" does not support blocks`,
          sectionId: section.id,
          blockId: block.id,
        });
        continue;
      }

      // Check if block type is allowed in this section
      if (!allowedBlocks.includes(block.type)) {
        errors.push({
          path: `sections.${section.id}.blocks.${block.id}`,
          message: `Block type "${block.type}" is not allowed in section "${section.type}"`,
          sectionId: section.id,
          blockId: block.id,
        });
        continue;
      }

      // Validate block settings
      const blockResult = validateBlock(block.type, block.settings);
      if (!blockResult.success && blockResult.errors) {
        errors.push(...blockResult.errors.map(err => ({
          ...err,
          sectionId: section.id,
          blockId: block.id,
          path: `sections.${section.id}.blocks.${block.id}.settings.${err.path}`,
        })));
      }

      // Check block-specific limits
      const blockDef = getBlockDefinition(block.type);
      if (blockDef?.limit) {
        const sameTypeBlocks = section.blocks.filter(b => b.type === block.type);
        if (sameTypeBlocks.length > blockDef.limit) {
          warnings.push({
            path: `sections.${section.id}.blocks`,
            message: `Block type "${block.type}" has a limit of ${blockDef.limit}, but ${sameTypeBlocks.length} are present`,
            sectionId: section.id,
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate all sections in a template
 */
export function validateTemplate(sections: SectionWithBlocks[]): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  for (const section of sections) {
    const result = validateSectionWithBlocks(section);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// ============================================================================
// SECTION HELPERS
// ============================================================================

/**
 * Create a new section with default settings
 */
export function createSection(sectionType: string, id?: string): SectionWithBlocks {
  const definition = getSectionDefinition(sectionType);
  
  return {
    id: id || `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: sectionType,
    settings: definition 
      ? { ...getSectionDefaults(sectionType) }
      : {},
    blocks: [],
  };
}

/**
 * Add a block to a section
 */
export function addBlockToSection(
  section: SectionWithBlocks, 
  blockType: string,
  position?: number
): { section: SectionWithBlocks; error?: string } {
  const allowedBlocks = getAllowedBlocks(section.type);
  const maxBlocks = getMaxBlocks(section.type);

  // Check if block type is allowed
  if (allowedBlocks.length > 0 && !allowedBlocks.includes(blockType)) {
    return { 
      section, 
      error: `Block type "${blockType}" is not allowed in section "${section.type}"` 
    };
  }

  // Check max blocks
  const currentBlocks = section.blocks || [];
  if (maxBlocks && currentBlocks.length >= maxBlocks) {
    return { 
      section, 
      error: `Maximum ${maxBlocks} blocks allowed in this section` 
    };
  }

  // Check block-specific limit
  const blockDef = getBlockDefinition(blockType);
  if (blockDef?.limit) {
    const sameTypeCount = currentBlocks.filter(b => b.type === blockType).length;
    if (sameTypeCount >= blockDef.limit) {
      return { 
        section, 
        error: `Maximum ${blockDef.limit} "${blockDef.name}" blocks allowed` 
      };
    }
  }

  // Create new block
  const newBlock: Block = {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: blockType,
    settings: getBlockDefaults(blockType),
  };

  // Add block at position or end
  const newBlocks = [...currentBlocks];
  if (position !== undefined && position >= 0 && position <= newBlocks.length) {
    newBlocks.splice(position, 0, newBlock);
  } else {
    newBlocks.push(newBlock);
  }

  return {
    section: { ...section, blocks: newBlocks },
  };
}

/**
 * Remove a block from a section
 */
export function removeBlockFromSection(
  section: SectionWithBlocks,
  blockId: string
): SectionWithBlocks {
  return {
    ...section,
    blocks: (section.blocks || []).filter(b => b.id !== blockId),
  };
}

/**
 * Reorder blocks in a section
 */
export function reorderBlocks(
  section: SectionWithBlocks,
  fromIndex: number,
  toIndex: number
): SectionWithBlocks {
  const blocks = [...(section.blocks || [])];
  const [removed] = blocks.splice(fromIndex, 1);
  blocks.splice(toIndex, 0, removed);
  
  return { ...section, blocks };
}

/**
 * Update block settings
 */
export function updateBlockSettings(
  section: SectionWithBlocks,
  blockId: string,
  settings: Record<string, unknown>
): { section: SectionWithBlocks; errors?: ValidationError[] } {
  const blockIndex = (section.blocks || []).findIndex(b => b.id === blockId);
  if (blockIndex === -1) {
    return { section };
  }

  const block = section.blocks![blockIndex];
  const validationResult = validateBlock(block.type, settings);

  if (!validationResult.success) {
    return {
      section,
      errors: validationResult.errors?.map(err => ({
        ...err,
        blockId,
        path: `blocks.${blockId}.settings.${err.path}`,
      })),
    };
  }

  const newBlocks = [...section.blocks!];
  newBlocks[blockIndex] = {
    ...block,
    settings: validationResult.data || settings,
  };

  return {
    section: { ...section, blocks: newBlocks },
  };
}

// ============================================================================
// THEME SETTINGS VALIDATION
// ============================================================================

import { z } from 'zod';

export const ThemeSettingsSchema = z.object({
  // Colors
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i).optional(),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i).optional(),

  // Typography
  typography: z.object({
    fontFamily: z.string().optional(),
    headingFont: z.string().optional(),
    baseFontSize: z.string().optional(),
  }).optional(),
  fontFamily: z.string().optional(),

  // Header
  headerLayout: z.enum(['default', 'centered', 'minimal']).optional(),
  headerShowSearch: z.boolean().optional(),
  headerShowCart: z.boolean().optional(),

  // Footer
  footerDescription: z.string().max(500).optional(),
  copyrightText: z.string().max(200).optional(),
  footerColumns: z.array(z.any()).optional(),

  // Floating elements
  floatingWhatsappEnabled: z.boolean().optional(),
  floatingWhatsappNumber: z.string().optional(),
  floatingWhatsappMessage: z.string().optional(),
  floatingCallEnabled: z.boolean().optional(),
  floatingCallNumber: z.string().optional(),

  // Features
  checkoutStyle: z.enum(['standard', 'express', 'one-page']).optional(),
  flashSale: z.any().optional(),
  trustBadges: z.any().optional(),
  marketingPopup: z.any().optional(),
  seo: z.any().optional(),

  // Banner
  bannerUrl: z.string().url().or(z.literal('')).optional(),
  bannerText: z.string().max(200).optional(),
  customCSS: z.string().max(50000).optional(),
}).passthrough(); // Allow additional properties

/**
 * Validate theme settings
 */
export function validateThemeSettings(settings: unknown): ValidationResult {
  const result = ThemeSettingsSchema.safeParse(settings);
  
  if (result.success) {
    return { valid: true, errors: [], warnings: [] };
  }

  return {
    valid: false,
    errors: result.error.errors.map(err => ({
      path: `themeSettings.${err.path.join('.')}`,
      message: err.message,
    })),
    warnings: [],
  };
}

// ============================================================================
// FULL TEMPLATE VALIDATION (for publish action)
// ============================================================================

/**
 * Validate entire template before publishing
 */
export function validateForPublish(
  sections: SectionWithBlocks[],
  themeSettings: unknown
): ValidationResult {
  const sectionsResult = validateTemplate(sections);
  const settingsResult = validateThemeSettings(themeSettings);

  return {
    valid: sectionsResult.valid && settingsResult.valid,
    errors: [...sectionsResult.errors, ...settingsResult.errors],
    warnings: [...sectionsResult.warnings, ...settingsResult.warnings],
  };
}
