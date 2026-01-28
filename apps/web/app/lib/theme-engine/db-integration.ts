/**
 * Theme Engine Integration - Connects Theme Engine to Database & Live Editor
 *
 * This module:
 * 1. Loads templates from database (template_sections_*)
 * 2. Falls back to JSON templates if no DB customization
 * 3. Provides API for Live Editor to save changes
 * 4. Handles publish/draft workflow
 */

import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, asc } from 'drizzle-orm';
import { z } from 'zod';
import {
  themes,
  themeTemplates,
  templateSectionsDraft,
  templateSectionsPublished,
  themeSettingsDraft,
  themeSettingsPublished,
  type TemplateKey,
} from '@db/schema_templates';
import { stores } from '@db/schema';
import type { TemplateJSON, SectionInstance, ThemeConfig, PageType } from './types';

// ============================================================================
// SAFE JSON PARSING UTILITIES
// ============================================================================

/** Schema for block instances from DB */
const dbBlockSchema = z.array(
  z.object({
    id: z.string(),
    type: z.string(),
    settings: z.record(z.string(), z.unknown()).default({}),
    disabled: z.boolean().optional(),
  })
);

/** Schema for section settings from DB */
const dbSettingsSchema = z.record(z.string(), z.unknown());

/** Schema for theme settings JSON from DB */
const dbThemeSettingsSchema = z.record(z.string(), z.unknown());

/** Safely parse JSON from database with Zod validation */
function safeParseSettings(json: string | null | undefined): Record<string, unknown> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    const result = dbSettingsSchema.safeParse(parsed);
    return result.success ? result.data : {};
  } catch (error) {
    console.warn('Settings JSON parse failed:', error);
    return {};
  }
}

function safeParseBlocks(json: string | null | undefined): z.infer<typeof dbBlockSchema> {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    const result = dbBlockSchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch (error) {
    console.warn('Blocks JSON parse failed:', error);
    return [];
  }
}

function safeParseThemeSettings(json: string | null | undefined): Record<string, unknown> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    const result = dbThemeSettingsSchema.safeParse(parsed);
    return result.success ? result.data : {};
  } catch (error) {
    console.warn('Theme settings JSON parse failed:', error);
    return {};
  }
}

// ============================================================================
// TEMPLATE LOADER FROM DATABASE
// ============================================================================

interface LoadTemplateOptions {
  storeId: number;
  templateKey: TemplateKey;
  useDraft?: boolean; // true = load draft, false = load published
}

/**
 * Load template from database
 * Falls back to JSON template if no customization exists
 */
export async function loadTemplateFromDB(
  db: D1Database,
  options: LoadTemplateOptions
): Promise<TemplateJSON | null> {
  const { storeId, templateKey, useDraft = false } = options;
  const drizzleDb = drizzle(db);

  // Get active theme for store
  const activeTheme = await drizzleDb
    .select()
    .from(themes)
    .where(and(eq(themes.shopId, storeId), eq(themes.isActive, 1)))
    .limit(1);

  if (!activeTheme[0]) {
    return null; // No theme, use JSON fallback
  }

  // Get template for this page type
  const template = await drizzleDb
    .select()
    .from(themeTemplates)
    .where(
      and(
        eq(themeTemplates.themeId, activeTheme[0].id),
        eq(themeTemplates.templateKey, templateKey)
      )
    )
    .limit(1);

  if (!template[0]) {
    return null; // No template customization, use JSON fallback
  }

  // Load sections (draft or published)
  const sectionsTable = useDraft ? templateSectionsDraft : templateSectionsPublished;
  const sections = await drizzleDb
    .select()
    .from(sectionsTable)
    .where(eq(sectionsTable.templateId, template[0].id))
    .orderBy(asc(sectionsTable.sortOrder));

  if (sections.length === 0) {
    return null; // No sections, use JSON fallback
  }

  // Convert DB sections to TemplateJSON format
  const templateJSON: TemplateJSON = {
    name: template[0].title || `${templateKey} Template`,
    sections: {},
    order: [],
  };

  for (const section of sections) {
    if (!section.enabled) continue;

    const sectionInstance: SectionInstance = {
      id: section.id,
      type: section.type,
      settings: safeParseSettings(section.propsJson),
      blocks: safeParseBlocks(section.blocksJson),
    };

    templateJSON.sections[section.id] = sectionInstance;
    templateJSON.order.push(section.id);
  }

  return templateJSON;
}

// ============================================================================
// THEME SETTINGS LOADER
// ============================================================================

/**
 * Load theme settings (colors, typography) from database
 */
export async function loadThemeSettingsFromDB(
  db: D1Database,
  storeId: number,
  useDraft: boolean = false
): Promise<Partial<ThemeConfig> | null> {
  const drizzleDb = drizzle(db);

  // Get active theme
  const activeTheme = await drizzleDb
    .select()
    .from(themes)
    .where(and(eq(themes.shopId, storeId), eq(themes.isActive, 1)))
    .limit(1);

  if (!activeTheme[0]) {
    return null;
  }

  // Load settings (draft or published)
  const settingsTable = useDraft ? themeSettingsDraft : themeSettingsPublished;
  const settings = await drizzleDb
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.themeId, activeTheme[0].id))
    .limit(1);

  if (!settings[0]) {
    return null;
  }

  const settingsJson = safeParseThemeSettings(settings[0].settingsJson);

  // Convert to ThemeConfig format
  return {
    name: activeTheme[0].name,
    colors: {
      primary: settingsJson.primaryColor || '#6366f1',
      secondary: settingsJson.secondaryColor,
      accent: settingsJson.accentColor || '#f59e0b',
      background: settingsJson.backgroundColor || '#ffffff',
      surface: settingsJson.surfaceColor || '#f9fafb',
      text: settingsJson.textColor || '#111827',
      textMuted: settingsJson.mutedColor || '#6b7280',
      border: settingsJson.borderColor || '#e5e7eb',
    },
    typography: {
      fontFamily: settingsJson.fontFamily || 'Inter',
      fontFamilyHeading: settingsJson.headingFontFamily,
      baseFontSize: settingsJson.baseFontSize || 16,
      lineHeight: settingsJson.lineHeight || 1.6,
    },
    // Add other settings as needed
  } as Partial<ThemeConfig>;
}

// ============================================================================
// SAVE TEMPLATE TO DATABASE
// ============================================================================

interface SaveTemplateOptions {
  storeId: number;
  templateKey: TemplateKey;
  sections: SectionInstance[];
}

/**
 * Save template sections to draft
 */
export async function saveTemplateDraft(
  db: D1Database,
  options: SaveTemplateOptions
): Promise<{ success: boolean; error?: string }> {
  const { storeId, templateKey, sections } = options;
  const drizzleDb = drizzle(db);

  try {
    // Get or create theme
    let theme = await drizzleDb
      .select()
      .from(themes)
      .where(and(eq(themes.shopId, storeId), eq(themes.isActive, 1)))
      .limit(1);

    if (!theme[0]) {
      // Create default theme
      const themeId = `theme_${storeId}_${Date.now()}`;
      await drizzleDb.insert(themes).values({
        id: themeId,
        shopId: storeId,
        name: 'Default Theme',
        isActive: 1,
      });
      theme = [
        {
          id: themeId,
          shopId: storeId,
          name: 'Default Theme',
          isActive: 1,
          presetId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }

    // Get or create template
    let template = await drizzleDb
      .select()
      .from(themeTemplates)
      .where(
        and(eq(themeTemplates.themeId, theme[0].id), eq(themeTemplates.templateKey, templateKey))
      )
      .limit(1);

    if (!template[0]) {
      const templateId = `tmpl_${storeId}_${templateKey}_${Date.now()}`;
      await drizzleDb.insert(themeTemplates).values({
        id: templateId,
        shopId: storeId,
        themeId: theme[0].id,
        templateKey,
        title: `${templateKey.charAt(0).toUpperCase() + templateKey.slice(1)} Template`,
      });
      template = [
        {
          id: templateId,
          shopId: storeId,
          themeId: theme[0].id,
          templateKey,
          title: null,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }

    // Delete existing draft sections
    await drizzleDb
      .delete(templateSectionsDraft)
      .where(eq(templateSectionsDraft.templateId, template[0].id));

    // Insert new sections
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      await drizzleDb.insert(templateSectionsDraft).values({
        id: section.id || `sec_${Date.now()}_${i}`,
        shopId: storeId,
        templateId: template[0].id,
        type: section.type,
        enabled: section.disabled ? 0 : 1,
        sortOrder: i,
        propsJson: JSON.stringify(section.settings || {}),
        blocksJson: JSON.stringify(section.blocks || []),
        version: 1,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to save template draft:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Publish draft to live
 */
export async function publishTemplate(
  db: D1Database,
  storeId: number,
  templateKey: TemplateKey
): Promise<{ success: boolean; error?: string }> {
  const drizzleDb = drizzle(db);

  try {
    // Get template
    const activeTheme = await drizzleDb
      .select()
      .from(themes)
      .where(and(eq(themes.shopId, storeId), eq(themes.isActive, 1)))
      .limit(1);

    if (!activeTheme[0]) {
      return { success: false, error: 'No active theme' };
    }

    const template = await drizzleDb
      .select()
      .from(themeTemplates)
      .where(
        and(
          eq(themeTemplates.themeId, activeTheme[0].id),
          eq(themeTemplates.templateKey, templateKey)
        )
      )
      .limit(1);

    if (!template[0]) {
      return { success: false, error: 'Template not found' };
    }

    // Load draft sections
    const draftSections = await drizzleDb
      .select()
      .from(templateSectionsDraft)
      .where(eq(templateSectionsDraft.templateId, template[0].id))
      .orderBy(asc(templateSectionsDraft.sortOrder));

    // Delete existing published sections
    await drizzleDb
      .delete(templateSectionsPublished)
      .where(eq(templateSectionsPublished.templateId, template[0].id));

    // Copy draft to published
    for (const section of draftSections) {
      await drizzleDb.insert(templateSectionsPublished).values({
        id: `pub_${section.id}`,
        shopId: storeId,
        templateId: template[0].id,
        type: section.type,
        enabled: section.enabled,
        sortOrder: section.sortOrder,
        propsJson: section.propsJson,
        blocksJson: section.blocksJson,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to publish template:', error);
    return { success: false, error: String(error) };
  }
}

// ============================================================================
// TEMPLATE KEY MAPPING
// ============================================================================

/**
 * Map PageType to TemplateKey
 */
export function pageTypeToTemplateKey(pageType: PageType): TemplateKey {
  const mapping: Record<string, TemplateKey> = {
    index: 'home',
    product: 'product',
    'product.fashion': 'product',
    'product.electronics': 'product',
    collection: 'collection',
    cart: 'cart',
    checkout: 'checkout',
    page: 'page',
    search: 'search',
    'customers/account': 'account',
  };

  return mapping[pageType] || 'home';
}

/**
 * Map TemplateKey to PageType
 */
export function templateKeyToPageType(templateKey: TemplateKey): PageType {
  const mapping: Record<TemplateKey, PageType> = {
    home: 'index',
    product: 'product',
    collection: 'collection',
    cart: 'cart',
    checkout: 'checkout',
    page: 'page',
    search: 'search',
    account: 'customers/account',
  };

  return mapping[templateKey];
}

// ============================================================================
// COMBINED LOADER (DB + JSON FALLBACK)
// ============================================================================

interface LoadCombinedTemplateOptions {
  db: D1Database;
  storeId: number;
  pageType: PageType;
  useDraft?: boolean;
}

/**
 * Load template with DB customization + JSON fallback
 */
export async function loadCombinedTemplate(
  options: LoadCombinedTemplateOptions
): Promise<TemplateJSON> {
  const { db, storeId, pageType, useDraft = false } = options;

  const templateKey = pageTypeToTemplateKey(pageType);

  // Try loading from DB first
  const dbTemplate = await loadTemplateFromDB(db, {
    storeId,
    templateKey,
    useDraft,
  });

  if (dbTemplate && dbTemplate.order.length > 0) {
    return dbTemplate;
  }

  // Fall back to JSON template
  const { loadTemplate } = await import('./utils/template-engine');
  return loadTemplate(pageType as any);
}

// ============================================================================
// EXPORT
// ============================================================================

export const ThemeEngineDB = {
  loadTemplateFromDB,
  loadThemeSettingsFromDB,
  saveTemplateDraft,
  publishTemplate,
  pageTypeToTemplateKey,
  templateKeyToPageType,
  loadCombinedTemplate,
};

export default ThemeEngineDB;
