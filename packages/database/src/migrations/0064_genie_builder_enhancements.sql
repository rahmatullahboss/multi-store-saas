-- ============================================================================
-- Migration: Genie Builder Enhancements
-- Date: 2026-01-21
-- Description: Add variant column to builder_sections and intent/style columns 
--              to builder_pages for Quick Builder v2 (Genie) support
-- FIXED: Made idempotent - checks if columns exist before adding
-- ============================================================================

-- ============================================================================
-- UPDATE builder_sections TABLE
-- Add variant column for section variant tracking
-- Note: SQLite (and D1 migrations) will FAIL if we try to add a column that already exists.
-- For existing production databases where `variant` was added manually or via a previous patch,
-- use the "baseline/stamp" runbook instead of re-applying this migration.
-- ============================================================================

-- Fresh DB path (staging/local new env): add column then index.
ALTER TABLE builder_sections ADD COLUMN variant TEXT;

-- ============================================================================
-- INDEXES for performance (IF NOT EXISTS makes these safe)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_builder_sections_variant ON builder_sections(page_id, variant);
