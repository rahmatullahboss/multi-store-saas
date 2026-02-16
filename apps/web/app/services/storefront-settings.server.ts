import type { ThemeConfig, SocialLinks } from '@db/types';
import { resolveStoreTheme, type StoreTemplateTheme } from '~/templates/store-registry';
import {
  getMVPSettings,
  getRawMVPSettings,
  type MVPSettingsWithTheme,
} from '~/services/mvp-settings.server';
import type { Database } from '~/lib/db.server';
import { DEFAULT_MVP_SETTINGS } from '~/config/mvp-theme-settings';

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
  mvpSettings: MVPSettingsWithTheme;
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

function asAnnouncement(value: unknown): ThemeConfig['announcement'] | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const text = asNonEmptyString(record.text);
  if (!text) return undefined;
  const link = asNonEmptyString(record.link) ?? undefined;
  return link ? { text, link } : { text };
}

/**
 * Unified storefront settings resolver for MVP.
 *
 * Source of truth:
 * 1) Template + base theme from store/themeConfig via resolveStoreTheme()
 * 2) Name/logo/favicon + primary/accent from MVP settings
 * 3) Legacy themeConfig only as fallback
 */
export async function resolveUnifiedStorefrontSettings(
  input: ResolveStorefrontSettingsInput
): Promise<UnifiedStorefrontSettings> {
  const { db, storeId, store } = input;
  const configRecord =
    input.themeConfig && typeof input.themeConfig === 'object'
      ? (input.themeConfig as Record<string, unknown>)
      : {};

  const { storeTemplateId, theme: baseTheme } = resolveStoreTheme(
    configRecord,
    (store.theme as string) || null
  );

  const rawMvpSettings = await getRawMVPSettings(db, storeId);
  const mvpSettings = await getMVPSettings(db, storeId, storeTemplateId);
  const themeDefaults = DEFAULT_MVP_SETTINGS[storeTemplateId] || DEFAULT_MVP_SETTINGS['starter-store'];

  const hasThemeConfigStoreName = asNonEmptyString(configRecord.storeName) !== null;
  const hasRealStoreName = asNonEmptyString(store.name) !== null;
  const mvpNameLooksDefault =
    asNonEmptyString(mvpSettings.storeName) === asNonEmptyString(themeDefaults.storeName);
  const shouldPreferStoreName =
    (!rawMvpSettings || mvpNameLooksDefault) && !hasThemeConfigStoreName && hasRealStoreName;

  const storeName = shouldPreferStoreName
    ? pickString(configRecord.storeName, store.name, mvpSettings.storeName) ?? 'Store'
    : pickString(mvpSettings.storeName, configRecord.storeName, store.name) ?? 'Store';
  const logo = pickString(mvpSettings.logo, configRecord.logo, store.logo);
  const favicon = pickString(mvpSettings.favicon, configRecord.favicon, store.favicon);

  const mergedTheme: StoreTemplateTheme = {
    ...baseTheme,
    primary: pickString(mvpSettings.primaryColor, configRecord.primaryColor, baseTheme.primary) ?? baseTheme.primary,
    accent: pickString(mvpSettings.accentColor, configRecord.accentColor, baseTheme.accent) ?? baseTheme.accent,
  };

  const mvpAnnouncementText = asNonEmptyString(mvpSettings.announcementText);
  const announcement =
    mvpSettings.showAnnouncement && mvpAnnouncementText
      ? { text: mvpAnnouncementText }
      : asAnnouncement(configRecord.announcement);

  const mergedThemeConfig: ThemeConfig & Record<string, unknown> = {
    ...configRecord,
    storeName,
    logo: logo ?? undefined,
    favicon: favicon ?? undefined,
    primaryColor: mergedTheme.primary,
    accentColor: mergedTheme.accent,
    ...(announcement ? { announcement } : {}),
  };

  return {
    storeTemplateId,
    mvpSettings,
    storeName,
    logo,
    favicon,
    theme: mergedTheme,
    themeConfig: mergedThemeConfig,
  };
}

export function resolveStoreSocialLinks(
  storeConfigSocialLinks: SocialLinks | null | undefined,
  fallbackSocialLinks: SocialLinks | null
): SocialLinks | null {
  return storeConfigSocialLinks ?? fallbackSocialLinks ?? null;
}
