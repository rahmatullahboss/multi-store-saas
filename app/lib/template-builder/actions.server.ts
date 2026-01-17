/**
 * Template Builder - Server Actions
 * 
 * Database operations for the theme template builder.
 * Works with template_sections_draft and template_sections_published tables.
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and, asc, sql, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { 
  themeTemplates,
  templateSectionsDraft, 
  templateSectionsPublished,
  themes,
  themeSettingsDraft,
  themeSettingsPublished,
  type ThemeTemplate,
  type TemplateSectionDraft,
} from '@db/schema';
import { getDefaultProps, validateSectionProps, isValidSectionType } from '~/lib/page-builder/registry';
import type { SectionType } from '~/lib/page-builder/types';

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateSection {
  id: string;
  templateId: string;
  type: SectionType;
  enabled: boolean;
  sortOrder: number;
  props: Record<string, unknown>;
  blocks?: unknown[];
  version: number;
}

export interface TemplateWithSections {
  id: string;
  shopId: number;
  themeId: string;
  templateKey: string;
  title: string | null;
  description: string | null;
  sections: TemplateSection[];
}

// ============================================================================
// HELPER: Parse section row
// ============================================================================

function parseSection(row: typeof templateSectionsDraft.$inferSelect): TemplateSection {
  let props: Record<string, unknown> = {};
  let blocks: unknown[] = [];
  
  try {
    props = JSON.parse(row.propsJson || '{}');
  } catch {
    props = {};
  }
  
  try {
    blocks = JSON.parse(row.blocksJson || '[]');
  } catch {
    blocks = [];
  }
  
  return {
    id: row.id,
    templateId: row.templateId,
    type: row.type as SectionType,
    enabled: Boolean(row.enabled),
    sortOrder: row.sortOrder,
    props,
    blocks,
    version: row.version ?? 1,
  };
}

// ============================================================================
// TEMPLATE OPERATIONS
// ============================================================================

/**
 * Get template by ID with all draft sections.
 */
export async function getTemplateWithSections(
  db: D1Database,
  templateId: string,
  storeId: number
): Promise<TemplateWithSections | null> {
  const drizzleDb = drizzle(db);
  
  // Get template
  const [template] = await drizzleDb
    .select()
    .from(themeTemplates)
    .where(and(
      eq(themeTemplates.id, templateId),
      eq(themeTemplates.shopId, storeId)
    ));
  
  if (!template) return null;
  
  // Get draft sections ordered
  const sections = await drizzleDb
    .select()
    .from(templateSectionsDraft)
    .where(eq(templateSectionsDraft.templateId, templateId))
    .orderBy(asc(templateSectionsDraft.sortOrder));
  
  return {
    id: template.id,
    shopId: template.shopId,
    themeId: template.themeId,
    templateKey: template.templateKey,
    title: template.title,
    description: template.description,
    sections: sections.map(parseSection),
  };
}

/**
 * Get template by theme ID and template key.
 */
export async function getTemplateByKey(
  db: D1Database,
  themeId: string,
  templateKey: string,
  storeId: number
): Promise<TemplateWithSections | null> {
  const drizzleDb = drizzle(db);
  
  const [template] = await drizzleDb
    .select()
    .from(themeTemplates)
    .where(and(
      eq(themeTemplates.themeId, themeId),
      eq(themeTemplates.templateKey, templateKey),
      eq(themeTemplates.shopId, storeId)
    ));
  
  if (!template) return null;
  
  return getTemplateWithSections(db, template.id, storeId);
}

// ============================================================================
// SECTION OPERATIONS
// ============================================================================

/**
 * List sections for a template (ordered).
 */
export async function listTemplateSections(
  db: D1Database,
  templateId: string
): Promise<TemplateSection[]> {
  const drizzleDb = drizzle(db);
  
  const sections = await drizzleDb
    .select()
    .from(templateSectionsDraft)
    .where(eq(templateSectionsDraft.templateId, templateId))
    .orderBy(asc(templateSectionsDraft.sortOrder));
  
  return sections.map(parseSection);
}

/**
 * Add a new section to template.
 */
export async function addTemplateSection(
  db: D1Database,
  templateId: string,
  storeId: number,
  type: string
): Promise<TemplateSection | { error: string }> {
  if (!isValidSectionType(type)) {
    return { error: `Invalid section type: ${type}` };
  }
  
  const drizzleDb = drizzle(db);
  
  // Get max sort_order
  const existing = await drizzleDb
    .select({ maxOrder: sql<number>`MAX(${templateSectionsDraft.sortOrder})` })
    .from(templateSectionsDraft)
    .where(eq(templateSectionsDraft.templateId, templateId));
  
  const nextOrder = (existing[0]?.maxOrder ?? -1) + 1;
  const defaultProps = getDefaultProps(type);
  const id = nanoid();
  
  await drizzleDb.insert(templateSectionsDraft).values({
    id,
    shopId: storeId,
    templateId,
    type,
    enabled: 1,
    sortOrder: nextOrder,
    propsJson: JSON.stringify(defaultProps),
    blocksJson: '[]',
    version: 1,
  });
  
  return {
    id,
    templateId,
    type: type as SectionType,
    enabled: true,
    sortOrder: nextOrder,
    props: defaultProps,
    blocks: [],
    version: 1,
  };
}

/**
 * Toggle section visibility.
 */
export async function toggleTemplateSection(
  db: D1Database,
  sectionId: string,
  enabled: boolean
) {
  const drizzleDb = drizzle(db);
  
  await drizzleDb
    .update(templateSectionsDraft)
    .set({
      enabled: enabled ? 1 : 0,
      version: sql`${templateSectionsDraft.version} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(templateSectionsDraft.id, sectionId));
  
  return { success: true };
}

/**
 * Update section props with validation.
 */
export async function updateTemplateSectionProps(
  db: D1Database,
  sectionId: string,
  type: string,
  props: unknown,
  expectedVersion?: number
): Promise<{ success: boolean; error?: string; newVersion?: number }> {
  // Validate props
  const validation = validateSectionProps(type, props);
  if (!validation.success) {
    return { success: false, error: validation.error };
  }
  
  const drizzleDb = drizzle(db);
  
  // Build update query
  const updateData = {
    propsJson: JSON.stringify(validation.data),
    version: sql`${templateSectionsDraft.version} + 1`,
    updatedAt: new Date(),
  };
  
  // If expectedVersion provided, add optimistic lock check
  if (expectedVersion !== undefined) {
    await drizzleDb
      .update(templateSectionsDraft)
      .set(updateData)
      .where(and(
        eq(templateSectionsDraft.id, sectionId),
        eq(templateSectionsDraft.version, expectedVersion)
      ));
    
    const [updated] = await drizzleDb
      .select({ version: templateSectionsDraft.version })
      .from(templateSectionsDraft)
      .where(eq(templateSectionsDraft.id, sectionId));
    
    if (updated?.version === expectedVersion) {
      return { 
        success: false, 
        error: 'Conflict: Section was modified. Please refresh and try again.' 
      };
    }
    
    return { success: true, newVersion: updated?.version ?? undefined };
  }
  
  // No version check
  await drizzleDb
    .update(templateSectionsDraft)
    .set(updateData)
    .where(eq(templateSectionsDraft.id, sectionId));
  
  return { success: true };
}

/**
 * Delete a section.
 */
export async function deleteTemplateSection(db: D1Database, sectionId: string) {
  const drizzleDb = drizzle(db);
  
  await drizzleDb
    .delete(templateSectionsDraft)
    .where(eq(templateSectionsDraft.id, sectionId));
  
  return { success: true };
}

/**
 * Reorder sections using batch update.
 */
export async function reorderTemplateSections(
  db: D1Database,
  templateId: string,
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  if (orderedIds.length === 0) {
    return { success: true };
  }
  
  // Verify all IDs belong to this template
  const drizzleDb = drizzle(db);
  const existing = await drizzleDb
    .select({ id: templateSectionsDraft.id })
    .from(templateSectionsDraft)
    .where(eq(templateSectionsDraft.templateId, templateId));
  
  const existingIds = new Set(existing.map(s => s.id));
  const invalidIds = orderedIds.filter(id => !existingIds.has(id));
  
  if (invalidIds.length > 0) {
    return { 
      success: false, 
      error: `Invalid section IDs: ${invalidIds.join(', ')}` 
    };
  }
  
  // Use raw D1 batch for atomic transaction
  const statements: D1PreparedStatement[] = [];
  
  // Step 1: Set all sort_orders to negative (avoid UNIQUE conflicts)
  statements.push(
    db.prepare(`
      UPDATE template_sections_draft 
      SET sort_order = -sort_order - 1000 
      WHERE template_id = ?
    `).bind(templateId)
  );
  
  // Step 2: Set final order
  const now = Date.now();
  orderedIds.forEach((id, index) => {
    statements.push(
      db.prepare(`
        UPDATE template_sections_draft 
        SET sort_order = ?, updated_at = ? 
        WHERE id = ? AND template_id = ?
      `).bind(index, now, id, templateId)
    );
  });
  
  // Execute as batch (atomic)
  try {
    await db.batch(statements);
    return { success: true };
  } catch (error) {
    console.error('Reorder failed:', error);
    return { success: false, error: 'Failed to reorder sections' };
  }
}

/**
 * Duplicate a section.
 */
export async function duplicateTemplateSection(
  db: D1Database,
  sectionId: string
): Promise<TemplateSection | { error: string }> {
  const drizzleDb = drizzle(db);
  
  // Get original section
  const [original] = await drizzleDb
    .select()
    .from(templateSectionsDraft)
    .where(eq(templateSectionsDraft.id, sectionId));
  
  if (!original) {
    return { error: 'Section not found' };
  }
  
  // Get max sort_order for the template
  const existing = await drizzleDb
    .select({ maxOrder: sql<number>`MAX(${templateSectionsDraft.sortOrder})` })
    .from(templateSectionsDraft)
    .where(eq(templateSectionsDraft.templateId, original.templateId));
  
  const nextOrder = (existing[0]?.maxOrder ?? -1) + 1;
  const id = nanoid();
  
  await drizzleDb.insert(templateSectionsDraft).values({
    id,
    shopId: original.shopId,
    templateId: original.templateId,
    type: original.type,
    enabled: original.enabled,
    sortOrder: nextOrder,
    propsJson: original.propsJson,
    blocksJson: original.blocksJson,
    version: 1,
  });
  
  return parseSection({
    id,
    shopId: original.shopId,
    templateId: original.templateId,
    type: original.type,
    enabled: original.enabled,
    sortOrder: nextOrder,
    propsJson: original.propsJson,
    blocksJson: original.blocksJson,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// ============================================================================
// PUBLISH OPERATIONS
// ============================================================================

/**
 * Publish a template.
 * Copies all draft sections to published sections.
 */
export async function publishTemplate(
  db: D1Database,
  templateId: string,
  storeId: number
): Promise<{ success: boolean; error?: string }> {
  const drizzleDb = drizzle(db);
  const now = new Date();
  
  // Verify template belongs to store
  const [template] = await drizzleDb
    .select()
    .from(themeTemplates)
    .where(and(
      eq(themeTemplates.id, templateId),
      eq(themeTemplates.shopId, storeId)
    ));
  
  if (!template) {
    return { success: false, error: 'Template not found' };
  }
  
  try {
    // Step 1: Delete existing published sections for this template
    await drizzleDb
      .delete(templateSectionsPublished)
      .where(eq(templateSectionsPublished.templateId, templateId));
    
    // Step 2: Get all draft sections
    const draftSections = await drizzleDb
      .select()
      .from(templateSectionsDraft)
      .where(eq(templateSectionsDraft.templateId, templateId))
      .orderBy(asc(templateSectionsDraft.sortOrder));
    
    // Step 3: Copy draft sections to published
    for (const section of draftSections) {
      await drizzleDb.insert(templateSectionsPublished).values({
        id: section.id, // Keep same ID for reference
        shopId: section.shopId,
        templateId: section.templateId,
        type: section.type,
        enabled: section.enabled,
        sortOrder: section.sortOrder,
        propsJson: section.propsJson,
        blocksJson: section.blocksJson,
        publishedAt: now,
      });
    }
    
    // Step 4: Update template updated_at
    await drizzleDb
      .update(themeTemplates)
      .set({ updatedAt: now })
      .where(eq(themeTemplates.id, templateId));
    
    return { success: true };
  } catch (error) {
    console.error('Publish template error:', error);
    return { success: false, error: 'Failed to publish template' };
  }
}

/**
 * Publish theme settings.
 * Copies draft settings to published settings.
 */
export async function publishThemeSettings(
  db: D1Database,
  themeId: string,
  storeId: number
): Promise<{ success: boolean; error?: string }> {
  const drizzleDb = drizzle(db);
  const now = new Date();
  
  // Get draft settings
  const [draftSettings] = await drizzleDb
    .select()
    .from(themeSettingsDraft)
    .where(and(
      eq(themeSettingsDraft.themeId, themeId),
      eq(themeSettingsDraft.shopId, storeId)
    ));
  
  if (!draftSettings) {
    return { success: false, error: 'Draft settings not found' };
  }
  
  try {
    // Delete existing published settings
    await drizzleDb
      .delete(themeSettingsPublished)
      .where(eq(themeSettingsPublished.themeId, themeId));
    
    // Insert new published settings
    await drizzleDb.insert(themeSettingsPublished).values({
      id: nanoid(),
      shopId: storeId,
      themeId,
      settingsJson: draftSettings.settingsJson,
      publishedAt: now,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Publish settings error:', error);
    return { success: false, error: 'Failed to publish settings' };
  }
}

/**
 * Publish all templates and settings for a theme.
 */
export async function publishTheme(
  db: D1Database,
  themeId: string,
  storeId: number
): Promise<{ success: boolean; error?: string }> {
  const drizzleDb = drizzle(db);
  
  // Get all templates for this theme
  const templates = await drizzleDb
    .select()
    .from(themeTemplates)
    .where(and(
      eq(themeTemplates.themeId, themeId),
      eq(themeTemplates.shopId, storeId)
    ));
  
  // Publish each template
  for (const template of templates) {
    const result = await publishTemplate(db, template.id, storeId);
    if (!result.success) {
      return result;
    }
  }
  
  // Publish settings
  const settingsResult = await publishThemeSettings(db, themeId, storeId);
  if (!settingsResult.success) {
    return settingsResult;
  }
  
  return { success: true };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize a template with default sections based on template key.
 */
export async function initializeTemplateWithDefaults(
  db: D1Database,
  templateId: string,
  storeId: number,
  templateKey: string
): Promise<TemplateSection[]> {
  // Default sections based on template type
  const defaultSectionsByType: Record<string, SectionType[]> = {
    home: ['hero', 'product-grid', 'features', 'newsletter'],
    product: ['product-header', 'product-gallery', 'product-info', 'product-description', 'related-products'],
    collection: ['collection-header', 'product-grid'],
    cart: ['cart-items', 'cart-summary'],
    checkout: [], // Checkout has special components
    page: ['hero', 'rich-text'],
  };
  
  const sectionTypes = defaultSectionsByType[templateKey] || ['hero', 'rich-text'];
  const sections: TemplateSection[] = [];
  
  for (const type of sectionTypes) {
    const result = await addTemplateSection(db, templateId, storeId, type);
    if ('id' in result) {
      sections.push(result);
    }
  }
  
  return sections;
}
