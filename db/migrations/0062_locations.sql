-- Migration: Add locations table for multi-warehouse inventory management
-- Enables stores to track inventory across multiple physical locations

-- Locations (warehouses/stores)
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT, -- Short code like "DHK-1", "CTG-2"
  address TEXT,
  city TEXT,
  district TEXT,
  phone TEXT,
  is_default INTEGER DEFAULT 0, -- 1 = default location for new inventory
  is_active INTEGER DEFAULT 1,
  fulfillment_priority INTEGER DEFAULT 0, -- Higher = prefer for order fulfillment
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

-- Location-specific inventory
CREATE TABLE IF NOT EXISTS location_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0, -- Reserved for pending orders
  reorder_point INTEGER DEFAULT 0, -- Alert when quantity falls below
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  UNIQUE(location_id, product_id, variant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_locations_store ON locations(store_id);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(store_id, is_active);
CREATE INDEX IF NOT EXISTS idx_location_inventory_location ON location_inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_location_inventory_product ON location_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_location_inventory_variant ON location_inventory(variant_id);
