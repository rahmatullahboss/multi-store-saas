-- Migration: Unified Storefront Settings
-- Date: 2026-02-16
-- Description: Add canonical storefront_settings column and archive table

-- Add storefront_settings column to stores table
ALTER TABLE stores ADD COLUMN storefront_settings TEXT;

-- Create store_settings_archives table for legacy snapshots
CREATE TABLE IF NOT EXISTS store_settings_archives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  release_tag TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_settings_archives_store ON store_settings_archives(store_id);
CREATE INDEX IF NOT EXISTS idx_settings_archives_source ON store_settings_archives(store_id, source);
