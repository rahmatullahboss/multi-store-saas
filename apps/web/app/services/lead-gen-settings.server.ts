/**
 * Lead Gen Settings Service
 *
 * Server-side service for CRUD operations on lead gen theme settings.
 * Follows EXACT same pattern as mvp-settings.server.ts for e-commerce.
 *
 * Uses the lead_gen_config JSON column in the stores table.
 *
 * @see apps/web/app/services/mvp-settings.server.ts - E-commerce equivalent
 */

import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { stores } from '@db/schema';
import {
  type LeadGenThemeSettings,
  type LeadGenSettingsWithTheme,
  validateLeadGenSettings,
  serializeLeadGenSettings,
  deserializeLeadGenSettings,
  DEFAULT_LEAD_GEN_SETTINGS,
} from '~/config/lead-gen-theme-settings';

// Re-export types for consumers
export type { LeadGenThemeSettings, LeadGenSettingsWithTheme };

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get lead gen settings for a store
 * Returns merged settings (user settings + theme defaults)
 *
 * @param db - Drizzle database instance
 * @param storeId - Store ID
 * @param themeId - Theme identifier (e.g., 'professional-services')
 * @returns Lead gen settings with theme ID
 */
export async function getLeadGenSettings(
  db: DrizzleD1Database<any>,
  storeId: number,
  themeId: string = 'professional-services'
): Promise<LeadGenSettingsWithTheme> {
  const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  if (!store) {
    // Store not found, return defaults
    const defaults = DEFAULT_LEAD_GEN_SETTINGS[themeId] || DEFAULT_LEAD_GEN_SETTINGS['professional-services'];
    return {
      ...defaults,
      themeId,
    };
  }

  // Parse lead_gen_config from database
  if (store.leadGenConfig) {
    try {
      return deserializeLeadGenSettings(store.leadGenConfig as string, themeId);
    } catch (error) {
      console.error('Failed to parse lead_gen_config:', error);
    }
  }

  // No settings saved, return defaults
  const defaults = DEFAULT_LEAD_GEN_SETTINGS[themeId] || DEFAULT_LEAD_GEN_SETTINGS['professional-services'];
  return {
    ...defaults,
    themeId,
  };
}

/**
 * Get raw lead gen settings (as stored in database)
 * Returns null if not found
 */
async function getRawLeadGenSettings(
  db: DrizzleD1Database<any>,
  storeId: number
): Promise<LeadGenSettingsWithTheme | null> {
  const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  if (!store || !store.leadGenConfig) {
    return null;
  }

  try {
    const parsed = JSON.parse(store.leadGenConfig as string);
    return parsed as LeadGenSettingsWithTheme;
  } catch (error) {
    console.error('Failed to parse raw lead_gen_config:', error);
    return null;
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Save lead gen settings for a store
 * Validates settings before saving
 *
 * @param db - Drizzle database instance
 * @param storeId - Store ID
 * @param settings - Lead gen settings to save (with theme ID)
 * @returns Saved settings
 */
export async function saveLeadGenSettings(
  db: DrizzleD1Database<any>,
  storeId: number,
  settings: LeadGenSettingsWithTheme
): Promise<LeadGenSettingsWithTheme> {
  // Validate settings
  const validated = validateLeadGenSettings(settings, settings.themeId);
  const fullSettings: LeadGenSettingsWithTheme = {
    ...validated,
    themeId: settings.themeId,
  };

  // Serialize for storage
  const serialized = serializeLeadGenSettings(fullSettings);

  // Update stores table
  await db
    .update(stores)
    .set({
      leadGenConfig: serialized,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  return fullSettings;
}

/**
 * Update specific lead gen settings (partial update)
 * Merges with existing settings
 *
 * @param db - Drizzle database instance
 * @param storeId - Store ID
 * @param updates - Partial settings to update
 * @returns Updated full settings
 */
export async function updateLeadGenSettings(
  db: DrizzleD1Database<any>,
  storeId: number,
  updates: Partial<LeadGenThemeSettings>
): Promise<LeadGenSettingsWithTheme> {
  // Get current settings
  const current = await getRawLeadGenSettings(db, storeId);

  if (current) {
    // Merge with existing
    const merged: LeadGenSettingsWithTheme = {
      ...current,
      ...updates,
    };
    return saveLeadGenSettings(db, storeId, merged);
  } else {
    // Initialize with defaults + updates
    const themeId = 'professional-services'; // Default theme
    const defaults = DEFAULT_LEAD_GEN_SETTINGS[themeId];
    const newSettings: LeadGenSettingsWithTheme = {
      ...defaults,
      ...updates,
      themeId,
    };
    return saveLeadGenSettings(db, storeId, newSettings);
  }
}

/**
 * Update theme for a store
 * Switches to a different lead gen theme
 *
 * @param db - Drizzle database instance
 * @param storeId - Store ID
 * @param newThemeId - New theme identifier
 * @returns Updated settings with new theme
 */
export async function updateLeadGenTheme(
  db: DrizzleD1Database<any>,
  storeId: number,
  newThemeId: string
): Promise<LeadGenSettingsWithTheme> {
  // Get current settings
  const current = await getRawLeadGenSettings(db, storeId);

  // Get new theme defaults
  const newDefaults = DEFAULT_LEAD_GEN_SETTINGS[newThemeId] || DEFAULT_LEAD_GEN_SETTINGS['professional-services'];

  if (current) {
    // Preserve user customizations, but update theme-specific defaults
    const updated: LeadGenSettingsWithTheme = {
      ...newDefaults, // New theme defaults
      ...current, // User customizations override
      themeId: newThemeId, // Update theme ID
    };
    return saveLeadGenSettings(db, storeId, updated);
  } else {
    // Initialize with new theme defaults
    const newSettings: LeadGenSettingsWithTheme = {
      ...newDefaults,
      themeId: newThemeId,
    };
    return saveLeadGenSettings(db, storeId, newSettings);
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete lead gen settings (reset to defaults)
 *
 * @param db - Drizzle database instance
 * @param storeId - Store ID
 */
export async function deleteLeadGenSettings(
  db: DrizzleD1Database<any>,
  storeId: number
): Promise<void> {
  await db
    .update(stores)
    .set({
      leadGenConfig: null,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if store has lead gen enabled
 * Based on lead_gen_config presence and enabled flag
 */
export async function isLeadGenEnabled(
  db: DrizzleD1Database<any>,
  storeId: number
): Promise<boolean> {
  const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  if (!store || !store.leadGenConfig) {
    return false;
  }

  try {
    const config = JSON.parse(store.leadGenConfig as string);
    return config.enabled === true;
  } catch (error) {
    return false;
  }
}

/**
 * Initialize default lead gen settings for a new store
 * Called during store creation when lead-gen mode is selected
 *
 * @param db - Drizzle database instance
 * @param storeId - Store ID
 * @param themeId - Initial theme (default: 'professional-services')
 * @param storeName - Business name
 * @returns Initialized settings
 */
export async function initializeLeadGenSettings(
  db: DrizzleD1Database<any>,
  storeId: number,
  themeId: string = 'professional-services',
  storeName?: string
): Promise<LeadGenSettingsWithTheme> {
  const defaults = DEFAULT_LEAD_GEN_SETTINGS[themeId] || DEFAULT_LEAD_GEN_SETTINGS['professional-services'];

  const settings: LeadGenSettingsWithTheme = {
    ...defaults,
    storeName: storeName || defaults.storeName,
    themeId,
  };

  return saveLeadGenSettings(db, storeId, settings);
}
