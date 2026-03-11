-- Migration: 0098_backfill_unified_settings.sql
-- Backfills storefront_settings column from legacy themeConfig for stores that haven't been migrated
--
-- This migration:
-- 1. Finds all stores where storefront_settings is NULL/empty but themeConfig has data
-- 2. Converts legacy themeConfig format to unified storefront_settings format
-- 3. Populates storefront_settings with the converted data
--
-- SAFE TO RUN: Only updates stores that need migration, skips already-migrated stores
-- Run: npx wrangler d1 execute multi-store-saas-db --remote --file=migrations/0098_backfill_unified_settings.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Update stores with NULL/empty storefront_settings but valid themeConfig ─────────────────────
-- This converts legacy themeConfig to unified format
-- Note: This is a best-effort migration. Some legacy fields may not have exact mappings.

UPDATE stores
SET storefront_settings = (
  SELECT json_object(
    'version', 'v1',
    'templateId', COALESCE(stores.template_id, 'starter-store'),
    'theme', json_object(
      'primary', json_extract(json_parse(stores.theme_config), '$.primaryColor'),
      'accent', json_extract(json_parse(stores.theme_config), '$.accentColor'),
      'background', json_extract(json_parse(stores.theme_config), '$.backgroundColor'),
      'text', json_extract(json_parse(stores.theme_config), '$.textColor'),
      'muted', json_extract(json_parse(stores.theme_config), '$.mutedColor'),
      'border', json_extract(json_parse(stores.theme_config), '$.borderColor')
    ),
    'branding', json_object(
      'logo', stores.logo,
      'favicon', stores.favicon,
      'storeName', stores.name
    ),
    'business', (
      SELECT json_object(
        'businessName', json_extract(json_parse(stores.business_info), '$.businessName'),
        'email', json_extract(json_parse(stores.business_info), '$.email'),
        'phone', json_extract(json_parse(stores.business_info), '$.phone'),
        'address', json_extract(json_parse(stores.business_info), '$.address'),
        'tradeLicense', json_extract(json_parse(stores.business_info), '$.tradeLicense')
      )
      WHERE stores.business_info IS NOT NULL
    ),
    'social', (
      SELECT json_object(
        'facebook', json_extract(json_parse(stores.social_links), '$.facebook'),
        'instagram', json_extract(json_parse(stores.social_links), '$.instagram'),
        'twitter', json_extract(json_parse(stores.social_links), '$.twitter'),
        'youtube', json_extract(json_parse(stores.social_links), '$.youtube')
      )
      WHERE stores.social_links IS NOT NULL
    ),
    'seo', json_object(
      'title', stores.seoTitle,
      'description', stores.seoDescription,
      'keywords', stores.seoKeywords
    ),
    'layout', json_object(
      'sidebarPosition', json_extract(json_parse(stores.theme_config), '$.layout.sidebarPosition'),
      'containerWidth', json_extract(json_parse(stores.theme_config), '$.layout.containerWidth')
    ),
    'flags', json_object(
      'enableReviews', 1,
      'enableWishlist', 0,
      'enableCompare', 0,
      'enableQuickView', 1
    ),
    'updatedAt', datetime('now')
  )
)
WHERE 
  -- storefront_settings is NULL or empty
  (storefront_settings IS NULL OR storefront_settings = '' OR storefront_settings = '{}')
  -- themeConfig has data
  AND theme_config IS NOT NULL 
  AND theme_config != ''
  AND theme_config != '{}'
  -- Only update stores that have a valid JSON themeConfig
  AND json_valid(theme_config);

-- ─── 2. Log how many stores were migrated ───────────────────────────────────────
-- This helps verify the migration worked correctly
SELECT 
  'Migration complete: ' || COUNT(*) || ' stores migrated to unified settings' as migration_status
FROM stores
WHERE storefront_settings IS NOT NULL 
  AND storefront_settings != ''
  AND storefront_settings != '{}';

-- ─── 3. Create index for faster lookups ─────────────────────────────────────────
-- Enables fast queries by templateId
CREATE INDEX IF NOT EXISTS idx_stores_template_id 
  ON stores (template_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- POST-MIGRATION VERIFICATION
-- ─────────────────────────────────────────────────────────────────────────────
-- Run these queries to verify migration:
--
-- 1. Check how many stores were migrated:
--    SELECT COUNT(*) FROM stores WHERE storefront_settings IS NOT NULL AND storefront_settings != '';
--
-- 2. Check stores still using legacy themeConfig:
--    SELECT id, name, subdomain FROM stores WHERE storefront_settings IS NULL OR storefront_settings = '';
--
-- 3. Sample migrated data:
--    SELECT id, name, storefront_settings FROM stores LIMIT 5;
-- ─────────────────────────────────────────────────────────────────────────────
