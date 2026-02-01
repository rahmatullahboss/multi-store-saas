/**
 * MVP Theme Settings Service
 *
 * Server-side service for CRUD operations on MVP theme settings.
 * Uses simple key-value storage in the database.
 *
 * @see AGENTS.md - MVP Simple Theme System section
 */

import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { storeMvpSettings } from '@db/schema';
import type { storeMvpSettings as StoreMvpSettingsTable } from '@db/schema';
import {
  type MVPThemeSettings,
  type MVPSettingsWithTheme,
  validateMVPSettings,
  serializeMVPSettings,
  deserializeMVPSettings,
  DEFAULT_MVP_SETTINGS,
} from '~/config/mvp-theme-settings';

// Re-export types for consumers
export type { MVPThemeSettings, MVPSettingsWithTheme };

// ============================================================================
// GET SETTINGS
// ============================================================================

/**
 * Get MVP settings for a store
 * Returns validated settings with theme defaults as fallback
 */
export async function getMVPSettings(
  db: DrizzleD1Database,
  storeId: number,
  themeId: string = 'starter-store'
): Promise<MVPSettingsWithTheme> {
  try {
    // Fetch from database
    const result = await db
      .select()
      .from(storeMvpSettings)
      .where(eq(storeMvpSettings.storeId, storeId))
      .limit(1);

    if (result.length > 0 && (result[0] as any).settingsJson) {
      const parsed = deserializeMVPSettings((result[0] as any).settingsJson);
      if (parsed) {
        // Validate and merge with defaults
        const validated = validateMVPSettings(parsed, themeId);
        return {
          ...validated,
          themeId: parsed.themeId || themeId,
        };
      }
    }
  } catch (error) {
    // Table might not exist yet, fall back to defaults
    console.warn('MVP Settings table not found, using defaults:', error);
  }

  // Return defaults if no settings found
  const defaults = DEFAULT_MVP_SETTINGS[themeId] || DEFAULT_MVP_SETTINGS['starter-store'];
  return {
    ...defaults,
    themeId,
  };
}

/**
 * Get raw settings from database (without validation)
 * Useful for admin editing
 */
export async function getRawMVPSettings(
  db: DrizzleD1Database,
  storeId: number
): Promise<MVPSettingsWithTheme | null> {
  try {
    const result = await db
      .select()
      .from(storeMvpSettings)
      .where(eq(storeMvpSettings.storeId, storeId))
      .limit(1);

    if (result.length > 0) {
      return deserializeMVPSettings((result[0] as any).settingsJson);
    }
  } catch (error) {
    console.warn('MVP Settings table not found:', error);
  }

  return null;
}

// ============================================================================
// SAVE SETTINGS
// ============================================================================

/**
 * Save or update MVP settings for a store
 */
export async function saveMVPSettings(
  db: DrizzleD1Database,
  storeId: number,
  settings: MVPSettingsWithTheme
): Promise<void> {
  const serialized = serializeMVPSettings(settings);
  const storeMvpSettingsTable = storeMvpSettings;

  try {
    // Check if settings already exist
    const existing = await db
      .select({ id: storeMvpSettingsTable.id })
      .from(storeMvpSettingsTable)
      .where(eq(storeMvpSettingsTable.storeId, storeId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(storeMvpSettingsTable)
        .set({
          settingsJson: serialized,
          updatedAt: new Date(),
        })
        .where(eq(storeMvpSettingsTable.storeId, storeId));
    } else {
      // Insert new
      await db.insert(storeMvpSettingsTable).values({
        storeId,
        themeId: settings.themeId,
        settingsJson: serialized,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Failed to save MVP settings:', error);
    throw error;
  }
}

/**
 * Update partial settings (for single field updates)
 */
export async function updatePartialMVPSettings(
  db: DrizzleD1Database,
  storeId: number,
  themeId: string,
  updates: Partial<MVPThemeSettings>
): Promise<MVPSettingsWithTheme> {
  // Get current settings
  const current = await getMVPSettings(db, storeId, themeId);

  // Merge updates
  const updated: MVPSettingsWithTheme = {
    ...current,
    ...updates,
    themeId,
  };

  // Save back
  await saveMVPSettings(db, storeId, updated);

  return updated;
}

// ============================================================================
// DELETE SETTINGS
// ============================================================================

/**
 * Delete MVP settings for a store
 * Falls back to defaults on next load
 */
export async function deleteMVPSettings(db: DrizzleD1Database, storeId: number): Promise<void> {
  try {
    const storeMvpSettingsTable = storeMvpSettings;
    await db.delete(storeMvpSettingsTable).where(eq(storeMvpSettingsTable.storeId, storeId));
  } catch (error) {
    console.error('Failed to delete MVP settings:', error);
    throw error;
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize default settings for a new store
 * Call this when a store is created
 */
export async function initializeMVPSettings(
  db: DrizzleD1Database,
  storeId: number,
  themeId: string = 'starter-store'
): Promise<MVPSettingsWithTheme> {
  const defaults = DEFAULT_MVP_SETTINGS[themeId] || DEFAULT_MVP_SETTINGS['starter-store'];

  const settings: MVPSettingsWithTheme = {
    ...defaults,
    themeId,
  };

  await saveMVPSettings(db, storeId, settings);

  return settings;
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Migrate from old themeConfig JSON to new MVP settings
 * Call this once during system upgrade
 */
export async function migrateFromOldThemeConfig(
  db: DrizzleD1Database,
  storeId: number,
  oldThemeConfig: string | null
): Promise<MVPSettingsWithTheme> {
  let parsedOld: Record<string, unknown> = {};

  if (oldThemeConfig) {
    try {
      parsedOld = JSON.parse(oldThemeConfig);
    } catch {
      // Invalid JSON, ignore
    }
  }

  const themeId = (parsedOld.storeTemplateId as string) || 'starter-store';

  // Extract any old settings that map to new system
  const migrated: Partial<MVPThemeSettings> = {
    storeName: parsedOld.storeName as string,
    logo: parsedOld.logo as string,
    primaryColor: parsedOld.primaryColor as string,
    accentColor: parsedOld.accentColor as string,
  };

  // Get current or create new
  const existing = await getRawMVPSettings(db, storeId);

  if (existing) {
    // Merge with existing
    const merged: MVPSettingsWithTheme = {
      ...existing,
      ...migrated,
      themeId,
    };
    await saveMVPSettings(db, storeId, merged);
    return merged;
  } else {
    // Initialize with migration data
    const defaults = DEFAULT_MVP_SETTINGS[themeId] || DEFAULT_MVP_SETTINGS['starter-store'];
    const settings: MVPSettingsWithTheme = {
      ...defaults,
      ...migrated,
      themeId,
    };
    await saveMVPSettings(db, storeId, settings);
    return settings;
  }
}
