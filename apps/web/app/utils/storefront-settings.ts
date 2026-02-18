import type { ThemeConfig } from '@db/types';
import type { UnifiedStorefrontSettingsV1 } from '~/services/storefront-settings.schema';

export function parseJsonSafe<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function normalizeCategoryValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function decodeCategoryParam(param: string): string {
  return decodeURIComponent(param).replace(/-/g, ' ').trim().replace(/\s+/g, ' ');
}

export function buildCategorySlugFromParam(param: string): string {
  return toCategorySlug(decodeCategoryParam(param));
}

export function toCategorySlug(value: string): string {
  return encodeURIComponent(normalizeCategoryValue(value)).replace(/%20/g, '-');
}

export function resolveCategoryFromParam(
  categories: string[],
  categoryParam: string | null
): string | null {
  if (!categoryParam) return null;
  const decoded = decodeCategoryParam(categoryParam);
  return (
    categories.find(
      (cat) => normalizeCategoryValue(cat) === normalizeCategoryValue(categoryParam)
    ) ||
    categories.find((cat) => normalizeCategoryValue(cat) === normalizeCategoryValue(decoded)) ||
    null
  );
}

export function findCategoryBySlug(categories: string[], slug: string): string | null {
  const decoded = decodeCategoryParam(slug);
  const slugAsSpaced = slug.replace(/-/g, ' ');

  return (
    categories.find((cat) => toCategorySlug(cat) === slug) ||
    categories.find((cat) => normalizeCategoryValue(cat) === normalizeCategoryValue(decoded)) ||
    categories.find(
      (cat) => normalizeCategoryValue(cat) === normalizeCategoryValue(slugAsSpaced)
    ) ||
    null
  );
}

export function buildUnifiedSocialLinks(settings: UnifiedStorefrontSettingsV1) {
  return {
    facebook: settings.social.facebook ?? undefined,
    instagram: settings.social.instagram ?? undefined,
    whatsapp: settings.social.whatsapp ?? undefined,
    twitter: settings.social.twitter ?? undefined,
    youtube: settings.social.youtube ?? undefined,
    linkedin: settings.social.linkedin ?? undefined,
  };
}

export function buildMergedThemeConfig(
  storeThemeConfigRaw: string | Record<string, unknown> | null | undefined,
  storeTemplateId: string,
  primary: string,
  accent: string,
  unifiedThemeConfig: Record<string, unknown>
): ThemeConfig {
  let storeThemeConfig: Record<string, unknown> | null = null;

  if (storeThemeConfigRaw) {
    if (typeof storeThemeConfigRaw === 'string') {
      storeThemeConfig = parseJsonSafe<Record<string, unknown>>(storeThemeConfigRaw);
    } else if (typeof storeThemeConfigRaw === 'object') {
      storeThemeConfig = storeThemeConfigRaw;
    }
  }

  return {
    ...(storeThemeConfig || {}),
    ...unifiedThemeConfig,
    primaryColor: primary,
    accentColor: accent,
    storeTemplateId,
  } as unknown as ThemeConfig;
}
