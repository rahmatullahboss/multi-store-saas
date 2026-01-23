/**
 * Version History Schema
 * 
 * Stores version history for templates, enabling rollback functionality
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// TEMPLATE VERSIONS
// ============================================================================
// Stores snapshots of published templates for rollback

export const templateVersions = sqliteTable('template_versions', {
  id: text('id').primaryKey(),
  storeId: integer('store_id').notNull(),
  templateId: text('template_id').notNull(),
  themeId: text('theme_id').notNull(),
  
  // Version info
  version: integer('version').notNull(),
  label: text('label'),  // Optional user-provided label like "Before holiday sale"
  
  // Snapshot of sections (JSON)
  sectionsJson: text('sections_json').notNull(),
  
  // Snapshot of theme settings (JSON)
  settingsJson: text('settings_json'),
  
  // Who published this version
  publishedBy: text('published_by'),  // User email or ID
  
  // Timestamps
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export interface TemplateVersion {
  id: string;
  storeId: number;
  templateId: string;
  themeId: string;
  version: number;
  label?: string | null;
  sectionsJson: string;
  settingsJson?: string | null;
  publishedBy?: string | null;
  createdAt?: string | null;
}

export interface ParsedTemplateVersion extends Omit<TemplateVersion, 'sectionsJson' | 'settingsJson'> {
  sections: Array<{
    id: string;
    type: string;
    settings: Record<string, unknown>;
    blocks?: Array<{
      id: string;
      type: string;
      settings: Record<string, unknown>;
    }>;
  }>;
  settings?: Record<string, unknown>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse a template version from database format
 */
export function parseTemplateVersion(version: TemplateVersion): ParsedTemplateVersion {
  return {
    ...version,
    sections: JSON.parse(version.sectionsJson),
    settings: version.settingsJson ? JSON.parse(version.settingsJson) : undefined,
  };
}

/**
 * Generate version ID
 */
export function generateVersionId(storeId: number, templateId: string, version: number): string {
  return `ver_${storeId}_${templateId}_v${version}_${Date.now()}`;
}
