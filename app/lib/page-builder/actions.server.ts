/**
 * Page Builder v2 - Server Actions
 * 
 * All database operations for the page builder.
 * Uses Drizzle ORM with Cloudflare D1.
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and, asc, sql, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { builderPages, builderSections } from '@db/schema_page_builder';
import { getDefaultProps, validateSectionProps, isValidSectionType } from './registry';
import type { BuilderSection, BuilderPage, SectionType } from './types';

// ============================================================================
// HELPER: Parse section row
// ============================================================================
function parseSection(row: typeof builderSections.$inferSelect): BuilderSection {
  let props: Record<string, unknown> = {};
  try {
    props = JSON.parse(row.propsJson || '{}');
  } catch {
    props = {};
  }
  
  return {
    id: row.id,
    pageId: row.pageId,
    type: row.type as SectionType,
    enabled: Boolean(row.enabled),
    sortOrder: row.sortOrder,
    props,
    version: row.version,
  };
}

/**
 * Parse section for public page (uses publishedPropsJson).
 * Falls back to propsJson if published content doesn't exist.
 */
function parseSectionPublished(row: typeof builderSections.$inferSelect): BuilderSection {
  let props: Record<string, unknown> = {};
  try {
    // Use published props if available, otherwise fall back to draft
    const propsSource = row.publishedPropsJson || row.propsJson || '{}';
    props = JSON.parse(propsSource);
  } catch {
    props = {};
  }
  
  return {
    id: row.id,
    pageId: row.pageId,
    type: row.type as SectionType,
    enabled: Boolean(row.enabled),
    sortOrder: row.sortOrder,
    props,
    version: row.version,
  };
}

// ============================================================================
// PAGE OPERATIONS
// ============================================================================

/**
 * Create a new page.
 */
export async function createPage(
  db: D1Database,
  storeId: number,
  data: { slug: string; title?: string; productId?: number }
) {
  const drizzleDb = drizzle(db);
  const id = nanoid();
  
  await drizzleDb.insert(builderPages).values({
    id,
    storeId,
    slug: data.slug,
    title: data.title || null,
    productId: data.productId || null,
    status: 'draft',
  });
  
  return { id, slug: data.slug };
}

/**
 * Get page by ID with all sections.
 */
export async function getPageWithSections(
  db: D1Database,
  pageId: string,
  storeId: number
): Promise<BuilderPage | null> {
  const drizzleDb = drizzle(db);
  
  // Get page
  const [page] = await drizzleDb
    .select()
    .from(builderPages)
    .where(and(
      eq(builderPages.id, pageId),
      eq(builderPages.storeId, storeId)
    ));
  
  if (!page) return null;
  
  // Get sections ordered
  const sections = await drizzleDb
    .select()
    .from(builderSections)
    .where(eq(builderSections.pageId, pageId))
    .orderBy(asc(builderSections.sortOrder));
  
  return {
    id: page.id,
    storeId: page.storeId,
    slug: page.slug,
    title: page.title,
    productId: page.productId,
    status: page.status ?? 'draft',
    // Floating button settings
    whatsappEnabled: page.whatsappEnabled,
    whatsappNumber: page.whatsappNumber,
    whatsappMessage: page.whatsappMessage,
    callEnabled: page.callEnabled,
    callNumber: page.callNumber,
    sections: sections.map(parseSection),
  };
}

/**
 * Get page by slug.
 */
export async function getPageBySlug(
  db: D1Database,
  storeId: number,
  slug: string
): Promise<BuilderPage | null> {
  const drizzleDb = drizzle(db);
  
  const [page] = await drizzleDb
    .select()
    .from(builderPages)
    .where(and(
      eq(builderPages.storeId, storeId),
      eq(builderPages.slug, slug)
    ));
  
  if (!page) return null;
  
  return getPageWithSections(db, page.id, storeId);
}

/**
 * List all pages for a store.
 */
export async function listPages(db: D1Database, storeId: number) {
  const drizzleDb = drizzle(db);
  
  return drizzleDb
    .select()
    .from(builderPages)
    .where(eq(builderPages.storeId, storeId))
    .orderBy(desc(builderPages.createdAt));
}

/**
 * Get published page by slug for public serving.
 * Uses publishedPropsJson instead of propsJson.
 */
export async function getPublishedPageBySlug(
  db: D1Database,
  storeId: number,
  slug: string
): Promise<BuilderPage | null> {
  const drizzleDb = drizzle(db);
  
  const [page] = await drizzleDb
    .select()
    .from(builderPages)
    .where(and(
      eq(builderPages.storeId, storeId),
      eq(builderPages.slug, slug),
      eq(builderPages.status, 'published')
    ));
  
  if (!page) return null;
  
  // Get sections with published props
  const sections = await drizzleDb
    .select()
    .from(builderSections)
    .where(eq(builderSections.pageId, page.id))
    .orderBy(asc(builderSections.sortOrder));
  
  return {
    id: page.id,
    storeId: page.storeId,
    slug: page.slug,
    title: page.title,
    productId: page.productId,
    status: page.status ?? 'draft',
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    ogImage: page.ogImage,
    publishedAt: page.publishedAt,
    sections: sections.map(parseSectionPublished), // Use published props!
  };
}

/**
 * Update page settings.
 */
export async function updatePageSettings(
  db: D1Database,
  pageId: string,
  storeId: number,
  data: {
    title?: string;
    slug?: string;
    seoTitle?: string;
    seoDescription?: string;
    ogImage?: string;
    // Floating button settings - WhatsApp & Call
    whatsappEnabled?: boolean;
    whatsappNumber?: string;
    whatsappMessage?: string;
    callEnabled?: boolean;
    callNumber?: string;
    // Order button settings
    orderEnabled?: boolean;
    orderText?: string;
    orderBgColor?: string;
    orderTextColor?: string;
    buttonPosition?: 'bottom-right' | 'bottom-left' | 'bottom-center';
    // Product
    productId?: number | null;
    // Custom HTML
    customHeaderHtml?: string;
    customFooterHtml?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
  }
) {
  const drizzleDb = drizzle(db);
  
  // Build update object, converting booleans to integers for SQLite
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  
  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
  if (data.ogImage !== undefined) updateData.ogImage = data.ogImage;
  if (data.whatsappEnabled !== undefined) updateData.whatsappEnabled = data.whatsappEnabled ? 1 : 0;
  if (data.whatsappNumber !== undefined) updateData.whatsappNumber = data.whatsappNumber;
  if (data.whatsappMessage !== undefined) updateData.whatsappMessage = data.whatsappMessage;
  if (data.callEnabled !== undefined) updateData.callEnabled = data.callEnabled ? 1 : 0;
  if (data.callNumber !== undefined) updateData.callNumber = data.callNumber;
  // Order button settings
  if (data.orderEnabled !== undefined) updateData.orderEnabled = data.orderEnabled ? 1 : 0;
  if (data.orderText !== undefined) updateData.orderText = data.orderText;
  if (data.orderBgColor !== undefined) updateData.orderBgColor = data.orderBgColor;
  if (data.orderTextColor !== undefined) updateData.orderTextColor = data.orderTextColor;
  if (data.buttonPosition !== undefined) updateData.buttonPosition = data.buttonPosition;
  // Other settings
  if (data.productId !== undefined) updateData.productId = data.productId;
  if (data.customHeaderHtml !== undefined) updateData.customHeaderHtml = data.customHeaderHtml;
  if (data.customFooterHtml !== undefined) updateData.customFooterHtml = data.customFooterHtml;
  if (data.canonicalUrl !== undefined) updateData.canonicalUrl = data.canonicalUrl;
  if (data.noIndex !== undefined) updateData.noIndex = data.noIndex ? 1 : 0;
  
  await drizzleDb
    .update(builderPages)
    .set(updateData)
    .where(and(
      eq(builderPages.id, pageId),
      eq(builderPages.storeId, storeId)
    ));
  
  return { success: true };
}

/**
 * Publish a page.
 * Copies all section draft content (propsJson) to published content (publishedPropsJson).
 */
export async function publishPage(db: D1Database, pageId: string, storeId: number) {
  const drizzleDb = drizzle(db);
  const now = new Date();
  
  // Step 1: Copy all section props to published props
  await db.prepare(`
    UPDATE builder_sections 
    SET published_props_json = props_json,
        published_at = ?
    WHERE page_id = ?
  `).bind(now.getTime(), pageId).run();
  
  // Step 2: Update page status
  await drizzleDb
    .update(builderPages)
    .set({
      status: 'published',
      publishedAt: now,
      lastPublishedAt: now,
      updatedAt: now,
    })
    .where(and(
      eq(builderPages.id, pageId),
      eq(builderPages.storeId, storeId)
    ));
  
  return { success: true };
}

/**
 * Delete a page and all its sections (cascade).
 */
export async function deletePage(db: D1Database, pageId: string, storeId: number) {
  const drizzleDb = drizzle(db);
  
  await drizzleDb
    .delete(builderPages)
    .where(and(
      eq(builderPages.id, pageId),
      eq(builderPages.storeId, storeId)
    ));
  
  return { success: true };
}

// ============================================================================
// SECTION OPERATIONS
// ============================================================================

/**
 * List sections for a page (ordered).
 */
export async function listSections(db: D1Database, pageId: string): Promise<BuilderSection[]> {
  const drizzleDb = drizzle(db);
  
  const sections = await drizzleDb
    .select()
    .from(builderSections)
    .where(eq(builderSections.pageId, pageId))
    .orderBy(asc(builderSections.sortOrder));
  
  return sections.map(parseSection);
}

/**
 * Add a new section at the end.
 */
export async function addSection(
  db: D1Database,
  pageId: string,
  type: string
): Promise<BuilderSection | { error: string }> {
  if (!isValidSectionType(type)) {
    return { error: `Invalid section type: ${type}` };
  }
  
  const drizzleDb = drizzle(db);
  
  // Get max sort_order
  const existing = await drizzleDb
    .select({ maxOrder: sql<number>`MAX(${builderSections.sortOrder})` })
    .from(builderSections)
    .where(eq(builderSections.pageId, pageId));
  
  const nextOrder = (existing[0]?.maxOrder ?? -1) + 1;
  const defaultProps = getDefaultProps(type);
  const id = nanoid();
  
  await drizzleDb.insert(builderSections).values({
    id,
    pageId,
    type,
    enabled: 1,
    sortOrder: nextOrder,
    propsJson: JSON.stringify(defaultProps),
    version: 1,
  });
  
  return {
    id,
    pageId,
    type: type as SectionType,
    enabled: true,
    sortOrder: nextOrder,
    props: defaultProps,
    version: 1,
  };
}

/**
 * Toggle section visibility.
 */
export async function toggleSection(
  db: D1Database,
  sectionId: string,
  enabled: boolean
) {
  const drizzleDb = drizzle(db);
  
  await drizzleDb
    .update(builderSections)
    .set({
      enabled: enabled ? 1 : 0,
      version: sql`${builderSections.version} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(builderSections.id, sectionId));
  
  return { success: true };
}

/**
 * Update section props with validation.
 */
export async function updateSectionProps(
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
    version: sql`${builderSections.version} + 1`,
    updatedAt: new Date(),
  };
  
  // If expectedVersion provided, add optimistic lock check
  if (expectedVersion !== undefined) {
    const result = await drizzleDb
      .update(builderSections)
      .set(updateData)
      .where(and(
        eq(builderSections.id, sectionId),
        eq(builderSections.version, expectedVersion)
      ));
    
    // D1 doesn't return rowsAffected easily, so we verify
    const [updated] = await drizzleDb
      .select({ version: builderSections.version })
      .from(builderSections)
      .where(eq(builderSections.id, sectionId));
    
    if (updated?.version === expectedVersion) {
      return { 
        success: false, 
        error: 'Conflict: Section was modified. Please refresh and try again.' 
      };
    }
    
    return { success: true, newVersion: updated?.version };
  }
  
  // No version check
  await drizzleDb
    .update(builderSections)
    .set(updateData)
    .where(eq(builderSections.id, sectionId));
  
  return { success: true };
}

/**
 * Delete a section.
 */
export async function deleteSection(db: D1Database, sectionId: string) {
  const drizzleDb = drizzle(db);
  
  await drizzleDb
    .delete(builderSections)
    .where(eq(builderSections.id, sectionId));
  
  return { success: true };
}

/**
 * Reorder sections using batch update.
 * 
 * Algorithm (from guideline):
 * 1. Set all sort_order to negative (avoid UNIQUE conflicts)
 * 2. Set final order based on orderedIds array
 */
export async function reorderSections(
  db: D1Database,
  pageId: string,
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  if (orderedIds.length === 0) {
    return { success: true };
  }
  
  // Verify all IDs belong to this page
  const drizzleDb = drizzle(db);
  const existing = await drizzleDb
    .select({ id: builderSections.id })
    .from(builderSections)
    .where(eq(builderSections.pageId, pageId));
  
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
      UPDATE builder_sections 
      SET sort_order = -sort_order - 1000 
      WHERE page_id = ?
    `).bind(pageId)
  );
  
  // Step 2: Set final order
  const now = Date.now();
  orderedIds.forEach((id, index) => {
    statements.push(
      db.prepare(`
        UPDATE builder_sections 
        SET sort_order = ?, updated_at = ? 
        WHERE id = ? AND page_id = ?
      `).bind(index, now, id, pageId)
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
export async function duplicateSection(
  db: D1Database,
  sectionId: string
): Promise<BuilderSection | { error: string }> {
  const drizzleDb = drizzle(db);
  
  // Get original section
  const [original] = await drizzleDb
    .select()
    .from(builderSections)
    .where(eq(builderSections.id, sectionId));
  
  if (!original) {
    return { error: 'Section not found' };
  }
  
  // Get max sort_order for the page
  const existing = await drizzleDb
    .select({ maxOrder: sql<number>`MAX(${builderSections.sortOrder})` })
    .from(builderSections)
    .where(eq(builderSections.pageId, original.pageId));
  
  const nextOrder = (existing[0]?.maxOrder ?? -1) + 1;
  const id = nanoid();
  
  await drizzleDb.insert(builderSections).values({
    id,
    pageId: original.pageId,
    type: original.type,
    enabled: original.enabled,
    sortOrder: nextOrder,
    propsJson: original.propsJson,
    version: 1,
  });
  
  return parseSection({
    id,
    pageId: original.pageId,
    type: original.type,
    enabled: original.enabled,
    sortOrder: nextOrder,
    propsJson: original.propsJson,
    publishedPropsJson: null, // Duplicated section starts as draft
    publishedAt: null,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Initialize a page with default sections.
 */
export async function initializePageWithDefaults(
  db: D1Database,
  pageId: string,
  sectionTypes: SectionType[] = ['hero', 'trust-badges', 'features', 'cta']
): Promise<BuilderSection[]> {
  const sections: BuilderSection[] = [];
  
  for (let i = 0; i < sectionTypes.length; i++) {
    const result = await addSection(db, pageId, sectionTypes[i]);
    if ('id' in result) {
      sections.push(result);
    }
  }
  
  return sections;
}

/**
 * Create a page from a template preset.
 */
export async function createPageFromTemplate(
  db: D1Database,
  storeId: number,
  templateId: string,
  slug: string,
  title?: string
): Promise<{ pageId: string; sections: BuilderSection[] } | { error: string }> {
  // Import template dynamically to avoid circular deps
  const { getTemplateById } = await import('./templates');
  
  const template = getTemplateById(templateId);
  if (!template) {
    return { error: `Template not found: ${templateId}` };
  }
  
  const drizzleDb = drizzle(db);
  const pageId = nanoid();
  
  // Create page
  await drizzleDb.insert(builderPages).values({
    id: pageId,
    storeId,
    slug,
    title: title || template.name,
    status: 'draft',
  });
  
  // Create sections from template
  const sections: BuilderSection[] = [];
  
  for (let i = 0; i < template.sections.length; i++) {
    const templateSection = template.sections[i];
    const id = nanoid();
    
    // Merge template props with default props
    const defaultProps = getDefaultProps(templateSection.type);
    const mergedProps = { ...defaultProps, ...templateSection.props };
    
    await drizzleDb.insert(builderSections).values({
      id,
      pageId,
      type: templateSection.type,
      enabled: 1,
      sortOrder: i,
      propsJson: JSON.stringify(mergedProps),
      version: 1,
    });
    
    sections.push({
      id,
      pageId,
      type: templateSection.type as SectionType,
      enabled: true,
      sortOrder: i,
      props: mergedProps,
      version: 1,
    });
  }
  
  return { pageId, sections };
}

