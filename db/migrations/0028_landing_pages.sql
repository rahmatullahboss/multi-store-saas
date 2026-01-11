-- Migration: Create landing_pages table for Elementor Builder
-- This table stores GrapesJS project data, HTML, and CSS for custom landing pages.

CREATE TABLE IF NOT EXISTS landing_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  project_data TEXT,
  html_content TEXT,
  css_content TEXT,
  is_published INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS landing_pages_store_id_idx ON landing_pages(store_id);
CREATE INDEX IF NOT EXISTS landing_pages_slug_idx ON landing_pages(store_id, slug);
