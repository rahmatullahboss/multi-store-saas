-- Migration: Make email optional in customers table
-- Rationale: Most BD customers only provide phone number, not email

-- IMPORTANT:
-- At this point in the migration chain, `customers` has 11 columns:
--   id, store_id, email, name, phone, address, created_at, updated_at,
--   risk_score, risk_checked_at, segment
-- We must preserve the exact column set when rebuilding the table, otherwise
-- `INSERT ... SELECT *` will fail on fresh databases.

-- Create new table with email as nullable (same columns as the current table)
CREATE TABLE IF NOT EXISTS customers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email TEXT,  -- Now nullable (was NOT NULL)
    name TEXT,
    phone TEXT,
    address TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    risk_score INTEGER,
    risk_checked_at INTEGER,
    segment TEXT DEFAULT 'new'
);

-- Copy existing data (explicit column list; safe on fresh + existing DBs)
INSERT INTO customers_new (
  id,
  store_id,
  email,
  name,
  phone,
  address,
  created_at,
  updated_at,
  risk_score,
  risk_checked_at,
  segment
)
SELECT
  id,
  store_id,
  email,
  name,
  phone,
  address,
  created_at,
  updated_at,
  risk_score,
  risk_checked_at,
  segment
FROM customers;

-- Drop old table and rename
DROP TABLE customers;
ALTER TABLE customers_new RENAME TO customers;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS customers_store_id_idx ON customers(store_id);
CREATE INDEX IF NOT EXISTS customers_segment_idx ON customers(store_id, segment);
