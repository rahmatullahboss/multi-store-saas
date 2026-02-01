-- Migration: Create store_mvp_settings table for MVP Simple Theme System
-- This table stores the 5 MVP settings for each store

CREATE TABLE IF NOT EXISTS store_mvp_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  settings_json TEXT NOT NULL, -- JSON: {storeName, logo, favicon, primaryColor, accentColor, showAnnouncement, announcementText, themeId}
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Create unique index to ensure one settings row per store
CREATE UNIQUE INDEX IF NOT EXISTS idx_mvp_settings_store ON store_mvp_settings(store_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mvp_settings_updated ON store_mvp_settings(updated_at);
