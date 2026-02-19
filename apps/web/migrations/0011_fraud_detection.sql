-- Migration: 0011_fraud_detection.sql

-- Add fraud_settings to stores table if it doesn't exist
-- Note: SQLite does not support IF NOT EXISTS for ADD COLUMN, so we use a safe approach or simply run it.
-- D1 Execute treats errors as fatal usually, so for idempotency during dev it can be tricky.
-- But since this is a new migration file, it should be fine.
ALTER TABLE stores ADD COLUMN fraud_settings TEXT;

-- Create phone_blacklist table
CREATE TABLE IF NOT EXISTS phone_blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    reason TEXT,
    added_by TEXT DEFAULT 'merchant', -- 'system' | 'merchant' | 'admin'
    created_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_phone_blacklist_phone ON phone_blacklist(phone);
CREATE INDEX IF NOT EXISTS idx_phone_blacklist_store ON phone_blacklist(store_id);

-- Create fraud_events table
CREATE TABLE IF NOT EXISTS fraud_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    phone TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    decision TEXT NOT NULL, -- 'allow' | 'verify' | 'hold' | 'block'
    signals TEXT, -- JSON
    resolved_by TEXT,
    resolved_at INTEGER,
    created_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_fraud_events_store ON fraud_events(store_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_phone ON fraud_events(phone);
CREATE INDEX IF NOT EXISTS idx_fraud_events_order ON fraud_events(order_id);
