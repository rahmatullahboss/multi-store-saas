-- Migration: 0046_page_builder_v2.sql
-- Quick Builder v2 - New architecture with proper section instances

-- ============================================================================
-- BUILDER PAGES TABLE - Page/Campaign metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS builder_pages (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  slug TEXT NOT NULL,
  title TEXT,
  product_id INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at INTEGER,
  template_id TEXT,
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  view_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY(store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id),
  UNIQUE(store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_builder_pages_store
ON builder_pages(store_id);

-- ============================================================================
-- BUILDER SECTIONS TABLE - Section instances with sort_order
-- ============================================================================
CREATE TABLE IF NOT EXISTS builder_sections (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL,
  props_json TEXT NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY(page_id) REFERENCES builder_pages(id) ON DELETE CASCADE
);

-- Critical index for ordered section retrieval
CREATE INDEX IF NOT EXISTS idx_builder_sections_order
ON builder_sections(page_id, sort_order);
