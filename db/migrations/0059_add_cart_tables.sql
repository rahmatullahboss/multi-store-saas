-- Migration: Add server-side cart tables
-- Created: 2026-01-18
-- Purpose: Cross-device cart sync, abandoned cart with items, server-side stock validation

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- Customer/Visitor identification
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  visitor_id TEXT, -- Anonymous visitor tracking
  session_id TEXT, -- Server session ID
  
  -- Currency
  currency TEXT DEFAULT 'BDT',
  
  -- Status and expiration
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'converted', 'abandoned', 'merged')),
  expires_at INTEGER,
  
  -- Timestamps
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- Product reference
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Quantity
  quantity INTEGER NOT NULL DEFAULT 1,
  
  -- Price snapshot at add time
  unit_price_snapshot REAL,
  title_snapshot TEXT,
  image_snapshot TEXT,
  variant_title_snapshot TEXT,
  
  -- Timestamps
  added_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Indexes for carts
CREATE INDEX IF NOT EXISTS idx_carts_store ON carts(store_id);
CREATE INDEX IF NOT EXISTS idx_carts_customer ON carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_carts_visitor ON carts(visitor_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON carts(store_id, status);

-- Indexes for cart_items
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
