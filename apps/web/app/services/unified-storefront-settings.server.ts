/**
 * Unified Storefront Settings Service
 *
 * Single source of truth for all storefront settings.
 * Provides read, write, migration, and archive operations.
 *
 * Read Flow:
 * 1. getUnifiedStorefrontSettings(storeId) reads stores.storefront_settings
 * 2. If missing, uses compatibility fallback (temporary)
 * 3. If fallback resolved, auto-backfills canonical column
 *
 * Write Flow:
 * 1. saveUnifiedStorefrontSettings updates canonical column
 * 2. Invalidates all caches (D1 + KV + DO)
 * 3. Optional dual-write to legacy columns (temporary)
 */

import { eq, and, isNull } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { stores, storeSettingsArchives } from '@db/schema';

import {
  type UnifiedStorefrontSettingsV1,
  type UnifiedStorefrontSettingsPatch,
  DEFAULT_UNIFIED_SETTINGS,
  DEFAULT_THEME_COLORS,
  UnifiedStorefrontSettingsV1Schema,
  serializeUnifiedSettings,
  deserializeUnifiedSettings,
  createUnifiedSettingsFromPatch,
  validateThemeId,
  type AllowedThemeId,
} from './storefront-settings.schema';

import { getRawMVPSettings } from '~/services/mvp-settings.server';

import type { StoreTemplateTheme } from '~/templates/store-registry';

// ============================================================================
// OPTIONS
// ============================================================================

export interface GetUnifiedSettingsOptions {
  /** Enable fallback to legacy sources (default: true) */
  enableFallback?: boolean;
  /** Skip cache and force DB read (default: false) */
  forceRefresh?: boolean;
  /** Environment for strict mode check */
  env?: unknown;
}

export interface SaveUnifiedSettingsOptions {
  /** Actor who made the change (for audit) */
  actorId?: number;
  /** Enable dual-write to legacy columns (default: false - for migration) */
  dualWrite?: boolean;
}

export interface MigrateLegacyOptions {
  /** Release tag for archive (e.g., 'v2.0') */
  releaseTag: string;
  /** Dry run only (default: false) */
  dryRun?: boolean;
}

interface LegacySources {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  themeConfig: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mvpSettings: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socialLinks: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  businessInfo: Record<string, any> | null;
  storeName: string | null;
  logo: string | null;
  favicon: string | null;
  tagline: string | null;
  description: string | null;
}

// ============================================================================
// GET SETTINGS
// ============================================================================

/**
 * Get unified storefront settings for a store
 * Returns canonical settings with optional fallback to legacy sources
 */
export async function getUnifiedStorefrontSettings<TSchema extends Record<string, unknown>>(
  db: DrizzleD1Database<TSchema>,
  storeId: number,
  options: GetUnifiedSettingsOptions = {}
): Promise<UnifiedStorefrontSettingsV1> {
  // Default: strict mode (no fallback). If env provided and UNIFIED_SETTINGS_STRICT is not "true", fallback may be enabled.
  // Explicit enableFallback option always wins.
  const strictMode = options.env ? isStrictMode(options.env) : true;
  const enableFallback = options.enableFallback ?? !strictMode;

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
    console.warn('Error reading unified settings, trying fallback:', error);
  }

  // Fallback: Try legacy sources if enabled
  if (enableFallback) {
    const legacySettings = await getLegacySettings(db, storeId);
    const unified = await migrateLegacyToUnified(legacySettings, storeId);

    // Auto-backfill canonical column (conditional — only if still NULL to prevent race conditions)
    try {
      await db
        .update(stores)
        .set({ storefrontSettings: serializeUnifiedSettings(unified) })
        .where(and(eq(stores.id, storeId), isNull(stores.storefrontSettings)));
    } catch (error) {
      console.warn('Failed to backfill unified settings:', error);
    }

    return {
      ...unified,
      flags: {
        ...unified.flags,
        legacyFallbackUsed: true,
      },
    };
  }

  // Return defaults if nothing found and fallback disabled (strict mode)
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
    .set({ storefrontSettings: serializeUnifiedSettings(validated) })
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
    .set({ storefrontSettings: serializeUnifiedSettings(validated) })
    .where(eq(stores.id, storeId));

  return validated;
}

// ============================================================================
// LEGACY MIGRATION HELPERS
// ============================================================================

/**
 * Get all legacy settings sources for migration
 */
async function getLegacySettings<TSchema extends Record<string, unknown>>(
  db: DrizzleD1Database<TSchema>,
  storeId: number
): Promise<LegacySources> {
  // Get store columns
  const storeResult = await db
    .select({
      name: stores.name,
      logo: stores.logo,
      favicon: stores.favicon,
      tagline: stores.tagline,
      description: stores.description,
      themeConfig: stores.themeConfig,
      socialLinks: stores.socialLinks,
      businessInfo: stores.businessInfo,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0] || {};

  // Parse themeConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let themeConfig: Record<string, any> | null = null;
  if (store.themeConfig) {
    try {
      themeConfig =
        typeof store.themeConfig === 'string' ? JSON.parse(store.themeConfig) : store.themeConfig;
    } catch {
      themeConfig = null;
    }
  }

  // Parse socialLinks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let socialLinks: Record<string, any> | null = null;
  if (store.socialLinks) {
    try {
      socialLinks =
        typeof store.socialLinks === 'string' ? JSON.parse(store.socialLinks) : store.socialLinks;
    } catch {
      socialLinks = null;
    }
  }

  // Parse businessInfo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let businessInfo: Record<string, any> | null = null;
  if (store.businessInfo) {
    try {
      businessInfo =
        typeof store.businessInfo === 'string'
          ? JSON.parse(store.businessInfo)
          : store.businessInfo;
    } catch {
      businessInfo = null;
    }
  }

  // Get MVP settings
  let mvpSettings: Record<string, unknown> | null = null;
  try {
    const rawMvpSettings = await getRawMVPSettings(db, storeId);
    mvpSettings = rawMvpSettings as unknown as Record<string, unknown>;
  } catch {
    mvpSettings = null;
  }

  return {
    themeConfig,
    mvpSettings,
    socialLinks,
    businessInfo,
    storeName: store.name || null,
    logo: store.logo || null,
    favicon: store.favicon || null,
    tagline: store.tagline || null,
    description: store.description || null,
  };
}

/**
 * Migrate legacy settings to unified format
 * Precedence: MVP settings > themeConfig > direct store columns
 */
async function migrateLegacyToUnified(
  legacy: LegacySources,
  _storeId: number
): Promise<UnifiedStorefrontSettingsV1> {
  // Determine template ID
  const templateId = resolveTemplateId(legacy);

  // Get theme defaults
  const themeDefaults = DEFAULT_THEME_COLORS[templateId] || DEFAULT_THEME_COLORS['starter-store'];

  // Theme settings - priority: mvpSettings > themeConfig > defaults
  const theme = {
    templateId,
    primary:
      legacy.mvpSettings?.primaryColor || legacy.themeConfig?.primaryColor || themeDefaults.primary,
    accent:
      legacy.mvpSettings?.accentColor || legacy.themeConfig?.accentColor || themeDefaults.accent,
    background: legacy.themeConfig?.background || '#ffffff',
    text: legacy.themeConfig?.text || '#1f2937',
    muted: legacy.themeConfig?.muted || '#6b7280',
    cardBg: legacy.themeConfig?.cardBg || '#ffffff',
    headerBg: legacy.themeConfig?.headerBg || '#ffffff',
    footerBg: legacy.themeConfig?.footerBg || '#1f2937',
    footerText: legacy.themeConfig?.footerText || '#ffffff',
  };

  // Branding - priority: mvpSettings > themeConfig > store columns
  const branding = {
    storeName:
      legacy.mvpSettings?.storeName ||
      legacy.themeConfig?.storeName ||
      legacy.storeName ||
      'My Store',
    logo: legacy.mvpSettings?.logo || legacy.themeConfig?.logo || legacy.logo || null,
    favicon: legacy.mvpSettings?.favicon || legacy.themeConfig?.favicon || legacy.favicon || null,
    tagline: legacy.themeConfig?.tagline || legacy.tagline || null,
    description: legacy.themeConfig?.description || legacy.description || null,
  };

  // Business info
  const business = {
    phone: legacy.businessInfo?.phone || legacy.themeConfig?.phone || null,
    email: legacy.businessInfo?.email || legacy.themeConfig?.email || null,
    address: legacy.businessInfo?.address || legacy.themeConfig?.address || null,
  };

  // Social links
  const social = {
    facebook: legacy.socialLinks?.facebook || legacy.themeConfig?.facebook || null,
    instagram: legacy.socialLinks?.instagram || legacy.themeConfig?.instagram || null,
    whatsapp: legacy.socialLinks?.whatsapp || legacy.themeConfig?.whatsapp || null,
    twitter: legacy.socialLinks?.twitter || legacy.themeConfig?.twitter || null,
    youtube: legacy.socialLinks?.youtube || null,
    linkedin: legacy.socialLinks?.linkedin || null,
  };

  // Announcement - from mvpSettings or themeConfig
  const announcementEnabled =
    legacy.mvpSettings?.showAnnouncement || legacy.themeConfig?.announcement?.enabled || false;
  const announcementText =
    legacy.mvpSettings?.announcementText || legacy.themeConfig?.announcement?.text || null;

  const announcement = {
    enabled: announcementEnabled,
    text: announcementText,
    link: legacy.themeConfig?.announcement?.link || null,
    backgroundColor: legacy.themeConfig?.announcement?.backgroundColor || '#4F46E5',
    textColor: legacy.themeConfig?.announcement?.textColor || '#ffffff',
  };

  // SEO
  const seo = {
    title: legacy.themeConfig?.seo?.title || null,
    description: legacy.themeConfig?.seo?.description || null,
    keywords: legacy.themeConfig?.seo?.keywords || [],
    ogImage: legacy.themeConfig?.seo?.ogImage || null,
  };

  // Checkout (from themeConfig only)
  const checkout = {
    shippingSummaryText: legacy.themeConfig?.checkout?.shippingSummaryText || null,
    showStockWarning: legacy.themeConfig?.checkout?.showStockWarning ?? true,
    enableGuestCheckout: legacy.themeConfig?.checkout?.enableGuestCheckout ?? true,
  };

  // Shipping config (from themeConfig/mvpSettings when available)
  const shippingConfig = {
    deliveryCharge: legacy.themeConfig?.deliveryCharge ?? legacy.mvpSettings?.deliveryCharge ?? 60,
    freeDeliveryAbove:
      legacy.themeConfig?.freeDeliveryAbove ?? legacy.mvpSettings?.freeDeliveryAbove ?? null,
    insideDhaka:
      legacy.themeConfig?.shippingConfig?.insideDhaka ??
      legacy.themeConfig?.insideDhaka ??
      legacy.mvpSettings?.shippingConfig?.insideDhaka ??
      legacy.mvpSettings?.insideDhaka ??
      60,
    outsideDhaka:
      legacy.themeConfig?.shippingConfig?.outsideDhaka ??
      legacy.themeConfig?.outsideDhaka ??
      legacy.mvpSettings?.shippingConfig?.outsideDhaka ??
      legacy.mvpSettings?.outsideDhaka ??
      120,
    freeShippingAbove:
      legacy.themeConfig?.shippingConfig?.freeShippingAbove ??
      legacy.themeConfig?.freeShippingAbove ??
      legacy.mvpSettings?.shippingConfig?.freeShippingAbove ??
      legacy.mvpSettings?.freeShippingAbove ??
      0,
    enabled:
      legacy.themeConfig?.shippingConfig?.enabled ??
      legacy.themeConfig?.shippingEnabled ??
      legacy.mvpSettings?.shippingConfig?.enabled ??
      legacy.mvpSettings?.shippingEnabled ??
      true,
  };

  // Hero banner (no legacy source - use defaults)
  const heroBanner = {
    mode: 'single' as const,
    overlayOpacity: 40,
    slides: [] as Array<{
      imageUrl: string | null;
      heading: string | null;
      subheading: string | null;
      ctaText: string | null;
      ctaLink: string | null;
    }>,
    fallbackHeadline: null,
  };

  // Trust badges (no legacy source - use defaults)
  const trustBadges = {
    badges: [
      { icon: 'truck' as const, title: 'দ্রুত ডেলিভারি', description: 'ঢাকায় ১-২ দিনে' },
      { icon: 'shield' as const, title: 'নিরাপদ পেমেন্ট', description: '১০০% সিকিউর' },
      { icon: 'refresh' as const, title: 'ইজি রিটার্ন', description: '৭ দিনের মধ্যে' },
    ],
  };

  // Why Choose Us (from legacy themeConfig if available)
  const whyChooseUs = legacy.themeConfig?.whyChooseUs || [
    { icon: '✨', title: 'প্রিমিয়াম কোয়ালিটি', description: 'উন্নত মানের নিশ্চয়তা' },
    { icon: '⚡', title: 'দ্রুত ডেলিভারি', description: 'দ্রুত ও নিরাপদ ডেলিভারি' },
    { icon: '💬', title: '২৪/৭ সাপোর্ট', description: 'আমরা ২৪ ঘণ্টা আপনার সেবায় নিয়োজিত' },
  ];

  // Typography (from legacy fontFamily if available)
  const typography = {
    fontFamily: legacy.themeConfig?.fontFamily || legacy.mvpSettings?.fontFamily || 'inter',
  };

  // Floating contact settings (from legacy themeConfig)
  const floating = {
    whatsappEnabled: legacy.themeConfig?.floatingWhatsappEnabled ?? false,
    whatsappNumber: legacy.themeConfig?.floatingWhatsappNumber ?? null,
    whatsappMessage: legacy.themeConfig?.floatingWhatsappMessage ?? null,
    callEnabled: legacy.themeConfig?.floatingCallEnabled ?? false,
    callNumber: legacy.themeConfig?.floatingCallNumber ?? null,
  };

  // Courier settings (from legacy themeConfig)
  const courier = {
    provider: legacy.themeConfig?.courier?.provider ?? null,
    pathao: legacy.themeConfig?.courier?.pathao ?? null,
    redx: legacy.themeConfig?.courier?.redx ?? null,
    steadfast: legacy.themeConfig?.courier?.steadfast ?? null,
  };

  // Navigation settings (from legacy themeConfig)
  const navigation = {
    headerMenu: legacy.themeConfig?.headerMenu ?? [],
    footerColumns: legacy.themeConfig?.footerColumns ?? [],
    footerDescription: legacy.themeConfig?.footerDescription ?? null,
  };

  return {
    version: 1,
    theme,
    branding,
    business,
    social,
    announcement,
    seo,
    checkout,
    shippingConfig,
    floating,
    courier,
    navigation,
    heroBanner,
    trustBadges,
    whyChooseUs,
    typography,
    flags: {
      sourceLocked: false,
      legacyFallbackUsed: false,
      migrationCompleted: true,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Resolve template ID from legacy sources
 */
function resolveTemplateId(legacy: LegacySources): AllowedThemeId {
  // Priority: mvpSettings > themeConfig > default
  const themeId =
    legacy.mvpSettings?.themeId || legacy.themeConfig?.storeTemplateId || 'starter-store';

  return validateThemeId(themeId);
}

// ============================================================================
// MIGRATION & ARCHIVE
// ============================================================================

/**
 * Migrate a single store's legacy settings to unified format
 * Archives legacy snapshots before migration
 */
export async function migrateStoreToUnifiedSettings<TSchema extends Record<string, unknown>>(
  db: DrizzleD1Database<TSchema>,
  storeId: number,
  options: MigrateLegacyOptions
): Promise<{ success: boolean; settings?: UnifiedStorefrontSettingsV1; error?: string }> {
  const { releaseTag, dryRun = false } = options;

  try {
    // Get current legacy settings
    const legacy = await getLegacySettings(db, storeId);

    // Archive each legacy source
    if (!dryRun) {
      await archiveLegacySettings(db, storeId, 'theme_config', legacy.themeConfig, releaseTag);
      await archiveLegacySettings(db, storeId, 'mvp_settings', legacy.mvpSettings, releaseTag);
      await archiveLegacySettings(db, storeId, 'social_links', legacy.socialLinks, releaseTag);
      await archiveLegacySettings(db, storeId, 'business_info', legacy.businessInfo, releaseTag);
    }

    // Migrate to unified
    const unified = await migrateLegacyToUnified(legacy, storeId);

    if (!dryRun) {
      // Save to canonical column
      await db
        .update(stores)
        .set({ storefrontSettings: serializeUnifiedSettings(unified) })
        .where(eq(stores.id, storeId));
    }

    return { success: true, settings: unified };
  } catch (error) {
    console.error('Migration failed for store:', storeId, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Archive legacy settings snapshot
 */
async function archiveLegacySettings<TSchema extends Record<string, unknown>>(
  db: DrizzleD1Database<TSchema>,
  storeId: number,
  source: string,
  data: unknown,
  releaseTag: string
): Promise<void> {
  if (!data) return;

  await db.insert(storeSettingsArchives).values({
    storeId,
    source,
    snapshotJson: JSON.stringify(data),
    schemaVersion: 1,
    releaseTag,
  });
}

/**
 * Migrate all stores (batch operation)
 */
export async function migrateAllStoresToUnifiedSettings<TSchema extends Record<string, unknown>>(
  db: DrizzleD1Database<TSchema>,
  releaseTag: string,
  dryRun: boolean = false
): Promise<{ migrated: number; failed: number; errors: string[] }> {
  // Get all stores
  const allStores = await db.select({ id: stores.id }).from(stores);

  let migrated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const store of allStores) {
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
// LEGACY FORMAT HELPER (for backward compatibility with routes)
// ============================================================================

export interface LegacyStorefrontSettings {
  storeTemplateId: string;
  mvpSettings: {
    storeName: string;
    logo: string | null;
    favicon: string | null;
    primaryColor: string;
    accentColor: string;
    showAnnouncement: boolean;
    announcementText: string | null;
    themeId: string;
  };
  storeName: string;
  logo: string | null;
  favicon: string | null;
  theme: StoreTemplateTheme;
  themeConfig: Record<string, unknown>;
}

export function toLegacyFormat(settings: UnifiedStorefrontSettingsV1): LegacyStorefrontSettings {
  const templateId = settings.theme.templateId;

  return {
    storeTemplateId: templateId,
    mvpSettings: {
      storeName: settings.branding.storeName,
      logo: settings.branding.logo,
      favicon: settings.branding.favicon,
      primaryColor: settings.theme.primary,
      accentColor: settings.theme.accent,
      showAnnouncement: settings.announcement.enabled,
      announcementText: settings.announcement.text,
      themeId: templateId,
    },
    storeName: settings.branding.storeName,
    logo: settings.branding.logo,
    favicon: settings.branding.favicon,
    theme: {
      primary: settings.theme.primary,
      accent: settings.theme.accent,
      background: settings.theme.background,
      text: settings.theme.text,
      muted: settings.theme.muted,
      cardBg: settings.theme.cardBg,
      headerBg: settings.theme.headerBg,
      footerBg: settings.theme.footerBg,
      footerText: settings.theme.footerText,
    },
    themeConfig: {
      storeName: settings.branding.storeName,
      logo: settings.branding.logo ?? undefined,
      favicon: settings.branding.favicon ?? undefined,
      tagline: settings.branding.tagline ?? undefined,
      description: settings.branding.description ?? undefined,
      primaryColor: settings.theme.primary,
      accentColor: settings.theme.accent,
      announcement: settings.announcement.enabled
        ? {
            text: settings.announcement.text || '',
            link: settings.announcement.link || undefined,
          }
        : undefined,
      headerMenu: settings.navigation?.headerMenu ?? [],
      footerColumns: settings.navigation?.footerColumns ?? [],
      footerDescription: settings.navigation?.footerDescription ?? '',
    },
  };
}
