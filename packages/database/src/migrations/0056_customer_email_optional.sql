-- Migration: Make email optional in customers table
-- Rationale: Most BD customers only provide phone number, not email

-- Create new table with email as nullable
CREATE TABLE IF NOT EXISTS customers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email TEXT,  -- Now nullable
    name TEXT,
    phone TEXT,
    address TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    risk_score INTEGER,
    risk_checked_at INTEGER,
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    last_order_at INTEGER,
    segment TEXT DEFAULT 'new',
    tags TEXT,
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'bronze',
    referred_by INTEGER
);

-- Copy existing data
INSERT INTO customers_new SELECT * FROM customers;

-- Drop old table and rename
DROP TABLE customers;
ALTER TABLE customers_new RENAME TO customers;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS customers_store_id_idx ON customers(store_id);
CREATE INDEX IF NOT EXISTS customers_segment_idx ON customers(store_id, segment);
