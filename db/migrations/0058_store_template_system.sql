-- Store Template System Migration
-- Enables Shopify-like theme/template architecture with draft/publish workflow

-- ============================================================================
-- THEMES TABLE - Theme container (one active per store)
-- ============================================================================
CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY NOT NULL,
  shop_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default Theme',
  preset_id TEXT, -- Reference to theme preset (e.g., 'rovo', 'daraz', 'nova-lux')
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_themes_shop ON themes(shop_id);
CREATE INDEX IF NOT EXISTS idx_themes_active ON themes(shop_id, is_active);

-- ============================================================================
-- THEME TEMPLATES TABLE - Page-type templates (home, product, collection, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS theme_templates (
  id TEXT PRIMARY KEY NOT NULL,
  shop_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL, -- 'home' | 'product' | 'collection' | 'cart' | 'checkout' | 'page'
  title TEXT,
  description TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(theme_id, template_key)
);

CREATE INDEX IF NOT EXISTS idx_theme_templates_theme ON theme_templates(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_templates_shop ON theme_templates(shop_id);

-- ============================================================================
-- TEMPLATE SECTIONS (DRAFT) - Editable section instances
-- ============================================================================
CREATE TABLE IF NOT EXISTS template_sections_draft (
  id TEXT PRIMARY KEY NOT NULL,
  shop_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES theme_templates(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- Section type: 'hero', 'product-gallery', 'features', etc.
  enabled INTEGER DEFAULT 1,
  sort_order INTEGER NOT NULL,
  props_json TEXT DEFAULT '{}',
  blocks_json TEXT DEFAULT '[]', -- For sections with nested blocks
  version INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_template_sections_draft_template ON template_sections_draft(template_id);
CREATE INDEX IF NOT EXISTS idx_template_sections_draft_order ON template_sections_draft(template_id, sort_order);

-- ============================================================================
-- TEMPLATE SECTIONS (PUBLISHED) - Immutable published snapshot
-- ============================================================================
CREATE TABLE IF NOT EXISTS template_sections_published (
  id TEXT PRIMARY KEY NOT NULL,
  shop_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES theme_templates(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  sort_order INTEGER NOT NULL,
  props_json TEXT DEFAULT '{}',
  blocks_json TEXT DEFAULT '[]',
  published_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_template_sections_published_template ON template_sections_published(template_id);
CREATE INDEX IF NOT EXISTS idx_template_sections_published_order ON template_sections_published(template_id, sort_order);

-- ============================================================================
-- THEME SETTINGS (DRAFT) - Global theme settings (colors, fonts, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS theme_settings_draft (
  id TEXT PRIMARY KEY NOT NULL,
  shop_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  settings_json TEXT DEFAULT '{}', -- Global theme config: colors, fonts, header/footer settings
  version INTEGER DEFAULT 1,
  updated_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(theme_id)
);

CREATE INDEX IF NOT EXISTS idx_theme_settings_draft_theme ON theme_settings_draft(theme_id);

-- ============================================================================
-- THEME SETTINGS (PUBLISHED) - Immutable published snapshot
-- ============================================================================
CREATE TABLE IF NOT EXISTS theme_settings_published (
  id TEXT PRIMARY KEY NOT NULL,
  shop_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  settings_json TEXT DEFAULT '{}',
  published_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(theme_id)
);

CREATE INDEX IF NOT EXISTS idx_theme_settings_published_theme ON theme_settings_published(theme_id);

-- ============================================================================
-- THEME PRESETS TABLE - Pre-built theme configurations (system-level)
-- ============================================================================
CREATE TABLE IF NOT EXISTS theme_presets (
  id TEXT PRIMARY KEY NOT NULL, -- e.g., 'rovo', 'daraz', 'nova-lux'
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT, -- 'luxury', 'modern', 'tech', 'artisan'
  default_settings_json TEXT DEFAULT '{}', -- Default theme settings
  default_templates_json TEXT DEFAULT '{}', -- Default template sections per page-type
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_theme_presets_category ON theme_presets(category);
CREATE INDEX IF NOT EXISTS idx_theme_presets_active ON theme_presets(is_active);
