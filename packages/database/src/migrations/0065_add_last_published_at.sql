-- ============================================================================
-- Migration: Add last_published_at column to builder_pages
-- Date: 2026-01-21
-- Description: Add last_published_at column to track when sections were last
--              published. This column is referenced in the schema but was
--              not included in the original migration.
-- ============================================================================

-- Add last_published_at column to builder_pages
ALTER TABLE builder_pages ADD COLUMN last_published_at INTEGER;
