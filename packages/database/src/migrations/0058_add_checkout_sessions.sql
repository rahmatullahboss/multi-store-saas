-- Migration: Add checkout_sessions table (World-class checkout flow)
-- Created: 2026-01-18
-- Purpose: Stock reservation, abandoned checkout recovery, server-side pricing, idempotent order creation

CREATE TABLE IF NOT EXISTS checkout_sessions (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- Cart snapshot
  cart_json TEXT NOT NULL,
  
  -- Customer info
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  customer_name TEXT,
  
  -- Addresses
  shipping_address_json TEXT,
  billing_address_json TEXT,
  
  -- Server-calculated pricing
  pricing_json TEXT,
  discount_code TEXT,
  
  -- Payment method
  payment_method TEXT DEFAULT 'cod' CHECK(payment_method IN ('cod', 'bkash', 'nagad', 'stripe')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'abandoned', 'expired')),
  
  -- Idempotency
  idempotency_key TEXT UNIQUE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Expiration
  expires_at INTEGER,
  
  -- Attribution
  landing_page_id INTEGER,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_store ON checkout_sessions(store_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_status ON checkout_sessions(store_id, status);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires ON checkout_sessions(expires_at);
