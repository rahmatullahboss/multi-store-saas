/**
 * Metafields Schema - Universal custom fields for products, collections, stores
 * 
 * Follows Shopify metafields pattern:
 * - Metafield Definitions: Templates for metafields (what custom fields are available)
 * - Metafields: Actual values for each entity (product, collection, store)
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// METAFIELD DEFINITIONS
// ============================================================================
// Templates that define what custom fields are available for each owner type

export const metafieldDefinitions = sqliteTable('metafield_definitions', {
  id: text('id').primaryKey(),
  storeId: integer('store_id').notNull(),
  
  // Namespace + key form unique identifier
  namespace: text('namespace').notNull(),  // e.g., 'custom', 'product_info', 'shipping'
  key: text('key').notNull(),              // e.g., 'warranty_years', 'material', 'care_instructions'
  
  // Display info
  name: text('name').notNull(),            // Human readable name: "Warranty Period"
  description: text('description'),        // Help text for merchants
  
  // Type and validation
  type: text('type').notNull(),            // 'single_line_text_field', 'number_integer', etc.
  ownerType: text('owner_type').notNull(), // 'product', 'collection', 'store', 'page'
  
  // Validation rules (JSON)
  validations: text('validations'),        // JSON: { min, max, regex, choices }
  
  // Pinned to show prominently
  pinned: integer('pinned').default(0),
  
  // Timestamps
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// METAFIELDS
// ============================================================================
// Actual values stored for each entity

export const metafields = sqliteTable('metafields', {
  id: text('id').primaryKey(),
  storeId: integer('store_id').notNull(),
  
  // Optional link to definition (can have ad-hoc metafields too)
  definitionId: text('definition_id'),
  
  // Namespace + key (same as definition or custom)
  namespace: text('namespace').notNull(),
  key: text('key').notNull(),
  
  // The actual value (JSON encoded for complex types)
  value: text('value').notNull(),
  
  // Type of value
  type: text('type').notNull(),
  
  // Owner reference (polymorphic)
  ownerId: text('owner_id').notNull(),     // product_id, collection_id, store_id, page_id
  ownerType: text('owner_type').notNull(), // 'product', 'collection', 'store', 'page'
  
  // Timestamps
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

// Metafield types (Shopify-aligned)
export type MetafieldType =
  // Single value types
  | 'single_line_text_field'   // Short text
  | 'multi_line_text_field'    // Long text
  | 'rich_text_field'          // HTML content
  | 'number_integer'           // Whole number
  | 'number_decimal'           // Decimal number
  | 'boolean'                  // True/false
  | 'date'                     // Date only
  | 'date_time'                // Date + time
  | 'url'                      // URL link
  | 'color'                    // Hex color
  | 'json'                     // Raw JSON
  | 'file_reference'           // File/image URL
  | 'product_reference'        // Product ID
  | 'collection_reference'     // Collection ID
  // List types (arrays)
  | 'list.single_line_text_field'
  | 'list.number_integer'
  | 'list.product_reference'
  | 'list.file_reference';

export type MetafieldOwnerType = 'product' | 'collection' | 'store' | 'page';

export interface MetafieldDefinition {
  id: string;
  storeId: number;
  namespace: string;
  key: string;
  name: string;
  description?: string | null;
  type: MetafieldType;
  ownerType: MetafieldOwnerType;
  validations?: {
    min?: number;
    max?: number;
    regex?: string;
    choices?: string[];
  } | null;
  pinned?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Metafield {
  id: string;
  storeId: number;
  definitionId?: string | null;
  namespace: string;
  key: string;
  value: string;
  type: MetafieldType;
  ownerId: string;
  ownerType: MetafieldOwnerType;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse metafield value based on type
 */
export function parseMetafieldValue(value: string, type: MetafieldType): unknown {
  try {
    switch (type) {
      case 'number_integer':
        return parseInt(value, 10);
      case 'number_decimal':
        return parseFloat(value);
      case 'boolean':
        return value === 'true' || value === '1';
      case 'json':
      case 'list.single_line_text_field':
      case 'list.number_integer':
      case 'list.product_reference':
      case 'list.file_reference':
        return JSON.parse(value);
      case 'date':
      case 'date_time':
        return new Date(value);
      default:
        return value;
    }
  } catch {
    return value;
  }
}

/**
 * Serialize value for storage
 */
export function serializeMetafieldValue(value: unknown, type: MetafieldType): string {
  switch (type) {
    case 'json':
    case 'list.single_line_text_field':
    case 'list.number_integer':
    case 'list.product_reference':
    case 'list.file_reference':
      return JSON.stringify(value);
    case 'boolean':
      return value ? 'true' : 'false';
    case 'date':
      return value instanceof Date ? value.toISOString().split('T')[0] : String(value);
    case 'date_time':
      return value instanceof Date ? value.toISOString() : String(value);
    default:
      return String(value);
  }
}

/**
 * Validate metafield value against type and validations
 */
export function validateMetafieldValue(
  value: unknown, 
  type: MetafieldType, 
  validations?: MetafieldDefinition['validations']
): { valid: boolean; error?: string } {
  // Type-specific validation
  switch (type) {
    case 'number_integer':
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        return { valid: false, error: 'Must be a whole number' };
      }
      if (validations?.min !== undefined && value < validations.min) {
        return { valid: false, error: `Minimum value is ${validations.min}` };
      }
      if (validations?.max !== undefined && value > validations.max) {
        return { valid: false, error: `Maximum value is ${validations.max}` };
      }
      break;

    case 'number_decimal':
      if (typeof value !== 'number') {
        return { valid: false, error: 'Must be a number' };
      }
      if (validations?.min !== undefined && value < validations.min) {
        return { valid: false, error: `Minimum value is ${validations.min}` };
      }
      if (validations?.max !== undefined && value > validations.max) {
        return { valid: false, error: `Maximum value is ${validations.max}` };
      }
      break;

    case 'single_line_text_field':
      if (typeof value !== 'string') {
        return { valid: false, error: 'Must be text' };
      }
      if (validations?.max !== undefined && value.length > validations.max) {
        return { valid: false, error: `Maximum ${validations.max} characters` };
      }
      if (validations?.regex) {
        const regex = new RegExp(validations.regex);
        if (!regex.test(value)) {
          return { valid: false, error: 'Invalid format' };
        }
      }
      if (validations?.choices && !validations.choices.includes(value)) {
        return { valid: false, error: `Must be one of: ${validations.choices.join(', ')}` };
      }
      break;

    case 'url':
      if (typeof value !== 'string') {
        return { valid: false, error: 'Must be a URL' };
      }
      try {
        new URL(value);
      } catch {
        return { valid: false, error: 'Invalid URL format' };
      }
      break;

    case 'color':
      if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{6}$/i.test(value)) {
        return { valid: false, error: 'Must be a hex color (e.g., #FF5500)' };
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        return { valid: false, error: 'Must be true or false' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Get default value for a metafield type
 */
export function getMetafieldDefaultValue(type: MetafieldType): unknown {
  switch (type) {
    case 'number_integer':
    case 'number_decimal':
      return 0;
    case 'boolean':
      return false;
    case 'list.single_line_text_field':
    case 'list.number_integer':
    case 'list.product_reference':
    case 'list.file_reference':
      return [];
    case 'json':
      return {};
    default:
      return '';
  }
}
