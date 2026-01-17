-- Migration: P1 - Add published props support to Page Builder v2
-- 
-- This enables draft/publish workflow for sections:
-- - propsJson = draft content (editable)
-- - publishedPropsJson = published content (served to public)

-- Columns already exist in production, commenting out to prevent duplicate errors
-- ALTER TABLE builder_sections ADD COLUMN published_props_json TEXT;
-- ALTER TABLE builder_sections ADD COLUMN published_at INTEGER;

-- Add last published timestamp to pages (may already exist)
-- ALTER TABLE builder_pages ADD COLUMN last_published_at INTEGER;
