-- Migration: Make email optional in customers table
-- Rationale: Most BD customers only provide phone number, not email

-- IMPORTANT:
-- This migration runs after table rebuilds that include auth/loyalty columns.
-- We must preserve the full column set while making `email` nullable, otherwise
-- downstream migrations (e.g. `0057_customer_auth.sql`) may fail on fresh DBs.

-- Create new table with email as nullable (preserve full column set)
CREATE TABLE IF NOT EXISTS customers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email TEXT,  -- Now nullable (was NOT NULL)
    name TEXT,
    phone TEXT,
    address TEXT,
    password_hash TEXT,
    google_id TEXT,
    auth_provider TEXT,
    last_login_at INTEGER,
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    last_order_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    risk_score INTEGER,
    risk_checked_at INTEGER,
    segment TEXT DEFAULT 'new',
    tags TEXT,
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'bronze',
    referred_by INTEGER
);

-- Copy existing data (explicit column list; safe on fresh + existing DBs)
INSERT INTO customers_new (
  id,
  store_id,
  email,
  name,
  phone,
  address,
  password_hash,
  google_id,
  auth_provider,
  last_login_at,
  total_orders,
  total_spent,
  last_order_at,
  created_at,
  updated_at,
  risk_score,
  risk_checked_at,
  segment,
  tags,
  loyalty_points,
  loyalty_tier,
  referred_by
)
SELECT
  id,
  store_id,
  email,
  name,
  phone,
  address,
  password_hash,
  google_id,
  auth_provider,
  last_login_at,
  total_orders,
  total_spent,
  last_order_at,
  created_at,
  updated_at,
  risk_score,
  risk_checked_at,
  segment,
  tags,
  loyalty_points,
  loyalty_tier,
  referred_by
FROM customers;

-- Drop old table and rename
DROP TABLE customers;
ALTER TABLE customers_new RENAME TO customers;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS customers_store_id_idx ON customers(store_id);
CREATE INDEX IF NOT EXISTS customers_segment_idx ON customers(store_id, segment);
CREATE INDEX IF NOT EXISTS customers_google_id_idx ON customers(store_id, google_id);
