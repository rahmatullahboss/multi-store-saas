/**
 * Unified Storefront Settings Service
 *
 * Single source of truth for all storefront settings.
 * Provides read, write, and cache invalidation operations.
 *
 * Read Flow:
 * 1. getUnifiedStorefrontSettings(storeId) reads stores.storefront_settings
 * 2. If missing, returns strict defaults (no legacy fallback)
 *
 * Write Flow:
 * 1. saveUnifiedStorefrontSettings updates canonical column
 * 2. Invalidates all caches (D1 + KV + DO)
 * 3. No dual-write to legacy columns
 */

import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { stores } from '@db/schema';

import {
  type UnifiedStorefrontSettingsV1,
  type UnifiedStorefrontSettingsPatch,
  DEFAULT_UNIFIED_SETTINGS,
  UnifiedStorefrontSettingsV1Schema,
  serializeUnifiedSettings,
  deserializeUnifiedSettings,
  createUnifiedSettingsFromPatch,
} from './storefront-settings.schema';

import type { StoreTemplateTheme } from '~/templates/store-registry';

// ============================================================================
// OPTIONS
// ============================================================================

export interface GetUnifiedSettingsOptions {
  /** Kept for callsite compatibility; fallback is disabled */
  enableFallback?: boolean;
  /** Skip cache and force DB read (default: false) */
  forceRefresh?: boolean;
  /** Environment for strict mode check */
  env?: unknown;
}

export interface SaveUnifiedSettingsOptions {
  /** Actor who made the change (for audit) */
  actorId?: number;
  /** Kept for callsite compatibility; dual-write is disabled */
  dualWrite?: boolean;
}

export interface MigrateLegacyOptions {
  /** Release tag for archive (e.g., 'v2.0') */
  releaseTag: string;
  /** Dry run only (default: false) */
  dryRun?: boolean;
}

// ============================================================================
// GET SETTINGS
// ============================================================================

/**
 * Get unified storefront settings for a store
 * Returns canonical settings without any legacy fallback
 */
export async function getUnifiedStorefrontSettings<TSchema extends Record<string, unknown>>(
  db: DrizzleD1Database<TSchema>,
  storeId: number,
  options: GetUnifiedSettingsOptions = {}
): Promise<UnifiedStorefrontSettingsV1> {
  void options;

  // Try to get from canonical column first
  try {
    const result = await db
      .select({ storefrontSettings: stores.storefrontSettings })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (result.length > 0 && result[0].storefrontSettings) {
      const parsed = deserializeUnifiedSettings(result[0].storefrontSettings);
      if (parsed) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Error reading unified settings:', error);
  }

  // Return defaults if nothing found (legacy fallback removed)
  return DEFAULT_UNIFIED_SETTINGS;
}

/**
 * Get raw settings from canonical column (without fallback)
 * Useful for admin editing
 */
export async function getRawUnifiedSettings<TSchema extends Record<string, unknown>>(
  db: DrizzleD1Database<TSchema>,
  storeId: number
): Promise<UnifiedStorefrontSettingsV1 | null> {
  try {
    const result = await db
      .select({ storefrontSettings: stores.storefrontSettings })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (result.length > 0 && result[0].storefrontSettings) {
      return deserializeUnifiedSettings(result[0].storefrontSettings);
    }
  } catch (error) {
    console.warn('Error reading raw unified settings:', error);
  }

  return null;
}

// ============================================================================
// SAVE SETTINGS
// ============================================================================

/**
 * Save unified storefront settings
 * Updates canonical column and invalidates all caches
 */
export async function saveUnifiedStorefrontSettings<TSchema extends Record<string, unknown>>(
  db: DrizzleD1Database<TSchema>,
  storeId: number,
  patch: UnifiedStorefrontSettingsPatch,
  _options: SaveUnifiedSettingsOptions = {}
): Promise<UnifiedStorefrontSettingsV1> {
  // Get current canonical settings only.
  const current = await getUnifiedStorefrontSettings(db, storeId, { enableFallback: false });

  // Apply patch
  const updated = createUnifiedSettingsFromPatch(current, patch);

  // Validate
  const validated = UnifiedStorefrontSettingsV1Schema.parse(updated);

  // Save to canonical column
  await db
    .update(stores)
    .set({
      storefrontSettings: serializeUnifiedSettings(validated),
      // Keep legacy-compatible column aligned to prevent route-level theme drift.
      theme: validated.theme.templateId,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  // Note: Cache invalidation will be handled by the caller or separate service
  // See: invalidateUnifiedSettingsCache

  return validated;
}

/**
 * Full settings replacement (not patch)
 */
export async function replaceUnifiedStorefrontSettings<TSchema extends Record<string, unknown>>(
  db: DrizzleD1Database<TSchema>,
  storeId: number,
  settings: UnifiedStorefrontSettingsV1
): Promise<UnifiedStorefrontSettingsV1> {
  // Validate
  const validated = UnifiedStorefrontSettingsV1Schema.parse(settings);

  // Save to canonical column
  await db
    .update(stores)
    .set({
      storefrontSettings: serializeUnifiedSettings(validated),
      theme: validated.theme.templateId,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  return validated;
}

// ============================================================================
// CANONICAL BACKFILL HELPERS
// ============================================================================

/**
 * Ensure a single store has canonical unified settings.
 * This does not read legacy columns. Missing stores receive a minimal settings object.
 */
export async function migrateStoreToUnifiedSettings<TSchema extends Record<string, unknown>>(
  db: DrizzleD1Database<TSchema>,
  storeId: number,
  options: MigrateLegacyOptions
): Promise<{ success: boolean; settings?: UnifiedStorefrontSettingsV1; error?: string }> {
  const { dryRun = false } = options;

  try {
    const storeResult = await db
      .select({
        name: stores.name,
        logo: stores.logo,
        favicon: stores.favicon,
        tagline: stores.tagline,
        description: stores.description,
        fontFamily: stores.fontFamily,
        storefrontSettings: stores.storefrontSettings,
      })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    const store = storeResult[0];
    if (!store) {
      return { success: false, error: `Store not found: ${storeId}` };
    }

    const existing = store.storefrontSettings
      ? deserializeUnifiedSettings(store.storefrontSettings)
      : null;
    if (existing) {
      return { success: true, settings: existing };
    }

    const unified: UnifiedStorefrontSettingsV1 = {
      ...DEFAULT_UNIFIED_SETTINGS,
      branding: {
        ...DEFAULT_UNIFIED_SETTINGS.branding,
        storeName: store.name || DEFAULT_UNIFIED_SETTINGS.branding.storeName,
        logo: store.logo || null,
        favicon: store.favicon || null,
        tagline: store.tagline || null,
        description: store.description || null,
      },
      typography: {
        ...DEFAULT_UNIFIED_SETTINGS.typography,
        fontFamily: store.fontFamily || DEFAULT_UNIFIED_SETTINGS.typography.fontFamily,
      },
      flags: {
        ...DEFAULT_UNIFIED_SETTINGS.flags,
        migrationCompleted: true,
      },
      updatedAt: new Date().toISOString(),
    };

    if (!dryRun) {
      await db
        .update(stores)
        .set({
          storefrontSettings: serializeUnifiedSettings(unified),
          theme: unified.theme.templateId,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));
    }

    return { success: true, settings: unified };
  } catch (error) {
    console.error('Migration failed for store:', storeId, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Backfill all stores missing canonical unified settings.
 */
export async function migrateAllStoresToUnifiedSettings<TSchema extends Record<string, unknown>>(
  db: DrizzleD1Database<TSchema>,
  releaseTag: string,
  dryRun: boolean = false
): Promise<{ migrated: number; failed: number; errors: string[] }> {
  void releaseTag;

  const allStores = await db
    .select({ id: stores.id, storefrontSettings: stores.storefrontSettings })
    .from(stores);
  const pending = allStores.filter((store) => !store.storefrontSettings);

  let migrated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const store of pending) {
    const result = await migrateStoreToUnifiedSettings(db, store.id, { releaseTag, dryRun });
    if (result.success) {
      migrated++;
    } else {
      failed++;
      errors.push(`Store ${store.id}: ${result.error}`);
    }
  }

  return { migrated, failed, errors };
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export interface FeatureFlags {
  UNIFIED_STOREFRONT_SETTINGS_READ: boolean;
  UNIFIED_STOREFRONT_SETTINGS_WRITE: boolean;
  UNIFIED_STOREFRONT_SETTINGS_FALLBACK: boolean;
  UNIFIED_STOREFRONT_SETTINGS_STRICT: boolean;
  UNIFIED_STOREFRONT_SETTINGS_STRICT_TEMPLATE_ALLOWLIST: boolean;
}

function getEnvFlag(env: unknown, key: string): string | undefined {
  if (!env || typeof env !== 'object') return undefined;
  const value = (env as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

export function getFeatureFlags(env: unknown): FeatureFlags {
  return {
    UNIFIED_STOREFRONT_SETTINGS_READ:
      getEnvFlag(env, 'UNIFIED_STOREFRONT_SETTINGS_READ') !== 'false',
    UNIFIED_STOREFRONT_SETTINGS_WRITE:
      getEnvFlag(env, 'UNIFIED_STOREFRONT_SETTINGS_WRITE') !== 'false',
    UNIFIED_STOREFRONT_SETTINGS_FALLBACK:
      getEnvFlag(env, 'UNIFIED_STOREFRONT_SETTINGS_FALLBACK') !== 'false',
    UNIFIED_STOREFRONT_SETTINGS_STRICT: getEnvFlag(env, 'UNIFIED_SETTINGS_STRICT') === 'true',
    UNIFIED_STOREFRONT_SETTINGS_STRICT_TEMPLATE_ALLOWLIST:
      getEnvFlag(env, 'UNIFIED_STOREFRONT_SETTINGS_STRICT_TEMPLATE_ALLOWLIST') === 'true',
  };
}

/**
 * Check if strict mode is enabled for unified settings
 * In strict mode, fallback to legacy sources is disabled
 */
export function isStrictMode(env: unknown): boolean {
  return getEnvFlag(env, 'UNIFIED_SETTINGS_STRICT') === 'true';
}

// ============================================================================
// BACKWARDS COMPATIBILITY
// ============================================================================

/**
 * Get shipping config directly from unified settings (single source of truth)
 * This replaces the need for resolveShippingConfig in routes
 */
export function getShippingConfigFromUnified(settings: UnifiedStorefrontSettingsV1): {
  enabled: boolean;
  insideDhaka: number;
  outsideDhaka: number;
  freeShippingAbove: number;
  freeDeliveryAbove: number | null;
  deliveryCharge: number;
} {
  const sc = settings.shippingConfig;
  return {
    enabled: sc.enabled ?? true,
    insideDhaka: sc.insideDhaka ?? 60,
    outsideDhaka: sc.outsideDhaka ?? 120,
    freeShippingAbove: sc.freeShippingAbove ?? 0,
    freeDeliveryAbove: sc.freeDeliveryAbove ?? null,
    deliveryCharge: sc.deliveryCharge ?? 60,
  };
}

/**
 * Get theme settings in format expected by existing components
 * This function bridges old and new systems during transition
 */
export async function getStorefrontThemeForRenderer<TSchema extends Record<string, unknown>>(
  db: DrizzleD1Database<TSchema>,
  storeId: number
): Promise<{
  storeTemplateId: string;
  theme: StoreTemplateTheme;
  storeName: string;
  logo: string | null;
  favicon: string | null;
}> {
  const settings = await getUnifiedStorefrontSettings(db, storeId);

  // Build theme object for renderer
  const theme: StoreTemplateTheme = {
    primary: settings.theme.primary,
    accent: settings.theme.accent,
    background: settings.theme.background,
    text: settings.theme.text,
    muted: settings.theme.muted,
    cardBg: settings.theme.cardBg,
    headerBg: settings.theme.headerBg,
    footerBg: settings.theme.footerBg,
    footerText: settings.theme.footerText,
  };

  return {
    storeTemplateId: settings.theme.templateId,
    theme,
    storeName: settings.branding.storeName,
    logo: settings.branding.logo,
    favicon: settings.branding.favicon,
  };
}

// ============================================================================
// CACHE INVALIDATION
// ============================================================================

export interface CacheInvalidationOptions {
  /** D1 database instance */
  db?: DrizzleD1Database<Record<string, unknown>>;
  /** KV namespace for edge caching */
  kv?: KVNamespace;
  /** Durable Object namespace for store config */
  doNamespace?: DurableObjectNamespace;
  /** Store ID for DO invalidation */
  storeId?: number;
  /** Subdomain for tenant cache invalidation */
  subdomain?: string;
  /** Custom domain for tenant cache invalidation */
  customDomain?: string;
}

/**
 * Invalidate all caches related to storefront settings
 * Call this after saving unified settings
 */
export async function invalidateUnifiedSettingsCache(
  env: {
    DB?: DrizzleD1Database<Record<string, unknown>>;
    KV?: KVNamespace;
    STORE_CONFIG_SERVICE?: Fetcher;
  },
  storeId: number,
  options: CacheInvalidationOptions = {}
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  // 1. D1 Cache invalidation (cache_store table)
  if (env.DB && typeof env.DB === 'object') {
    try {
      const { cacheStore } = await import('@db/schema');
      const importedSql = (await import('drizzle-orm')).sql;

      const db = env.DB as DrizzleD1Database<Record<string, unknown>>;
      await db
        .delete(cacheStore)
        .where(importedSql`${cacheStore.key} LIKE ${`%store:${storeId}%`}`);
    } catch (error) {
      errors.push(`D1 cache: ${String(error)}`);
    }
  }

  // 2. KV Cache invalidation
  if (env.KV) {
    try {
      const kv = env.KV;

      await kv.delete(`store:config:${storeId}`).catch(() => {});

      if (options.subdomain) {
        await kv.delete(`tenant:sub:${options.subdomain}`).catch(() => {});
      }
      if (options.customDomain) {
        await kv.delete(`tenant:dom:${options.customDomain}`).catch(() => {});
      }

      const list = await kv.list({ prefix: `store:${storeId}:` });
      await Promise.all(list.keys.map((k) => kv.delete(k.name).catch(() => {})));
    } catch (error) {
      errors.push(`KV cache: ${String(error)}`);
    }
  }

  // 3. Store Config DO cache invalidation (via service binding)
  if (env.STORE_CONFIG_SERVICE) {
    try {
      await env.STORE_CONFIG_SERVICE.fetch(`http://internal/do/${storeId}/invalidate`, {
        method: 'POST',
      });
    } catch (error) {
      errors.push(`DO cache: ${String(error)}`);
    }
  }

  // 4. Product KV cache version bump (for settings-dependent caching)
  if (env.KV) {
    try {
      const kv = env.KV;
      const versionKey = `store:${storeId}:settingsVersion`;
      const currentVersion = await kv.get(versionKey);
      const newVersion = currentVersion ? parseInt(currentVersion) + 1 : 1;
      await kv.put(versionKey, String(newVersion), { expirationTtl: 86400 * 30 });
    } catch (error) {
      errors.push(`Settings version bump: ${String(error)}`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Quick cache invalidation helper for save operations
 * Convenience function that combines save + invalidation
 */
export async function saveUnifiedStorefrontSettingsWithCacheInvalidation<
  TSchema extends Record<string, unknown>,
>(
  db: DrizzleD1Database<TSchema>,
  env: {
    DB?: DrizzleD1Database<Record<string, unknown>>;
    KV?: KVNamespace;
    STORE_CONFIG_SERVICE?: Fetcher;
  },
  storeId: number,
  patch: UnifiedStorefrontSettingsPatch,
  options: SaveUnifiedSettingsOptions = {}
): Promise<{
  settings: UnifiedStorefrontSettingsV1;
  cacheInvalidation: { success: boolean; errors: string[] };
}> {
  // Save settings
  const settings = await saveUnifiedStorefrontSettings(db, storeId, patch, options);

  // Invalidate all caches (D1 + KV + DO) in one call
  const cacheInvalidation = await invalidateUnifiedSettingsCache(env, storeId, {
    storeId,
  });

  return { settings, cacheInvalidation };
}

// ============================================================================
// EXPORTS
// ============================================================================
