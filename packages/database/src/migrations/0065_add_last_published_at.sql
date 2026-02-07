-- Migration: Add last_published_at column to builder_pages
-- Date: 2026-01-21
-- Adds last_published_at column and an index.
-- NOTE: If your production DB already has this column from historical/manual changes,
-- you should baseline/stamp this migration as applied (see DB adoption runbook),
-- instead of re-running it against production.

ALTER TABLE builder_pages ADD COLUMN last_published_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_builder_pages_last_published ON builder_pages(store_id, last_published_at);
