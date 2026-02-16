/**
 * Unified Storefront Settings Resolver (Backward Compatibility Layer)
 *
 * This file provides backward compatibility for routes that use the old
 * resolveUnifiedStorefrontSettings interface.
 *
 * Internally, it now uses the new unified-storefront-settings.server.ts service
 * which reads from the canonical stores.storefront_settings column.
 */

import type { ThemeConfig, SocialLinks } from '@db/types';
import { resolveStoreTheme, type StoreTemplateTheme } from '~/templates/store-registry';
import type { Database } from '~/lib/db.server';
import { DEFAULT_MVP_SETTINGS } from '~/config/mvp-theme-settings';

import {
  getUnifiedStorefrontSettings,
  getStorefrontThemeForRenderer,
} from './unified-storefront-settings.server';

interface StoreLike {
  id: number;
  name: string | null;
  logo: string | null;
  favicon: string | null;
  currency: string | null;
  theme: string | null;
}

interface ResolveStorefrontSettingsInput {
  db: Database;
  storeId: number;
  store: StoreLike;
  themeConfig: Record<string, unknown> | null | undefined;
}

export interface UnifiedStorefrontSettings {
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
  themeConfig: ThemeConfig & Record<string, unknown>;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    const normalized = asNonEmptyString(value);
    if (normalized) return normalized;
  }
  return null;
}

/**
 * Unified storefront settings resolver for MVP.
 *
 * This function now uses the canonical stores.storefront_settings column
 * via the new unified service, with backward compatibility for existing routes.
 *
 * Source of truth (NEW):
 * 1) stores.storefront_settings (canonical column)
 * 2) Fallback to legacy sources with auto-migration
 */
export async function resolveUnifiedStorefrontSettings(
  input: ResolveStorefrontSettingsInput
): Promise<UnifiedStorefrontSettings> {
  const { db, storeId, store } = input;

  // Use new unified service to get canonical settings
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
    enableFallback: true,
  });

  // Transform to old interface format for backward compatibility
  const storeTemplateId = unifiedSettings.theme.templateId;
  const themeDefaults =
    DEFAULT_MVP_SETTINGS[storeTemplateId] || DEFAULT_MVP_SETTINGS['starter-store'];

  // Build StoreTemplateTheme from unified settings
  const theme: StoreTemplateTheme = {
    primary: unifiedSettings.theme.primary,
    accent: unifiedSettings.theme.accent,
    background: unifiedSettings.theme.background,
    text: unifiedSettings.theme.text,
    muted: unifiedSettings.theme.muted,
    cardBg: unifiedSettings.theme.cardBg,
    headerBg: unifiedSettings.theme.headerBg,
    footerBg: unifiedSettings.theme.footerBg,
    footerText: unifiedSettings.theme.footerText,
  };

  // Build mvpSettings-like object for backward compatibility
  const mvpSettings = {
    storeName: unifiedSettings.branding.storeName,
    logo: unifiedSettings.branding.logo,
    favicon: unifiedSettings.branding.favicon,
    primaryColor: unifiedSettings.theme.primary,
    accentColor: unifiedSettings.theme.accent,
    showAnnouncement: unifiedSettings.announcement.enabled,
    announcementText: unifiedSettings.announcement.text,
    themeId: storeTemplateId,
  };

  // Build themeConfig for backward compatibility
  const legacyThemeConfig: ThemeConfig & Record<string, unknown> = {
    storeName: unifiedSettings.branding.storeName,
    logo: unifiedSettings.branding.logo ?? undefined,
    favicon: unifiedSettings.branding.favicon ?? undefined,
    tagline: unifiedSettings.branding.tagline ?? undefined,
    description: unifiedSettings.branding.description ?? undefined,
    primaryColor: unifiedSettings.theme.primary,
    accentColor: unifiedSettings.theme.accent,
    announcement: unifiedSettings.announcement.enabled
      ? {
          text: unifiedSettings.announcement.text || '',
          link: unifiedSettings.announcement.link || undefined,
        }
      : undefined,
  };

  return {
    storeTemplateId,
    mvpSettings,
    storeName: unifiedSettings.branding.storeName,
    logo: unifiedSettings.branding.logo,
    favicon: unifiedSettings.branding.favicon,
    theme,
    themeConfig: legacyThemeConfig,
  };
}

export function resolveStoreSocialLinks(
  storeConfigSocialLinks: SocialLinks | null | undefined,
  fallbackSocialLinks: SocialLinks | null
): SocialLinks | null {
  return storeConfigSocialLinks ?? fallbackSocialLinks ?? null;
}
