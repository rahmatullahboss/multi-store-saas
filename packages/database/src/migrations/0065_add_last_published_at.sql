-- Migration: Add last_published_at column to builder_pages
-- Date: 2026-01-21
-- Note: Column already exists in production, this is a no-op migration
-- Just create an index for safety

CREATE INDEX IF NOT EXISTS idx_builder_pages_last_published ON builder_pages(store_id, last_published_at);
