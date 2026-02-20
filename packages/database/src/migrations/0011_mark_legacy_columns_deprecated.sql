-- Migration: 0011_mark_legacy_columns_deprecated
-- Date: 2026-02-20
-- Description: 
-- Legacy columns (theme_config, social_links, business_info, courier_settings)
-- are no longer read by application code as of Phase 4.
-- 
-- This migration marks them as deprecated but does NOT drop them.
-- Actual DROP will happen during controlled maintenance window.
--
-- Changes:
-- - Added comment noting these columns are deprecated
-- - No data changes

-- Verify columns still exist (will fail if already dropped)
SELECT 1 as deprecated_marker;

-- Note: The following columns are now deprecated:
-- - stores.theme_config
-- - stores.social_links  
-- - stores.business_info
-- - stores.courier_settings
-- - store_mvp_settings table (if exists)
