-- Migration: Add Version History
-- Description: Stores template version snapshots for rollback functionality

CREATE TABLE IF NOT EXISTS template_versions (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  template_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  label TEXT,
  sections_json TEXT NOT NULL,
  settings_json TEXT,
  published_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_template_versions_store 
  ON template_versions(store_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_template 
  ON template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_theme 
  ON template_versions(theme_id, template_id, version DESC);
