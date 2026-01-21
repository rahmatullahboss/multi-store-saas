-- Migration: Add Metafields System
-- Description: Universal custom fields for products, collections, stores (Shopify-style)

-- ============================================================================
-- METAFIELD DEFINITIONS
-- ============================================================================
-- Templates that define what custom fields are available

CREATE TABLE IF NOT EXISTS metafield_definitions (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  owner_type TEXT NOT NULL,
  validations TEXT,
  pinned INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, namespace, key, owner_type)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_metafield_definitions_store 
  ON metafield_definitions(store_id);
CREATE INDEX IF NOT EXISTS idx_metafield_definitions_owner_type 
  ON metafield_definitions(store_id, owner_type);

-- ============================================================================
-- METAFIELDS
-- ============================================================================
-- Actual values stored for each entity

CREATE TABLE IF NOT EXISTS metafields (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  definition_id TEXT,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  owner_type TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, namespace, key, owner_id, owner_type),
  FOREIGN KEY (definition_id) REFERENCES metafield_definitions(id) ON DELETE SET NULL
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_metafields_store 
  ON metafields(store_id);
CREATE INDEX IF NOT EXISTS idx_metafields_owner 
  ON metafields(store_id, owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_metafields_namespace 
  ON metafields(store_id, namespace, key);
