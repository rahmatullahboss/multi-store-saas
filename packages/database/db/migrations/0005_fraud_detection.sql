-- Fraud Detection System - D1 Migration
-- Phone blacklist and fraud event audit tables

-- Phone blacklist (global + per-store)
CREATE TABLE IF NOT EXISTS phone_blacklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  reason TEXT,
  added_by TEXT DEFAULT 'merchant',
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_phone_blacklist_phone ON phone_blacklist(phone);
CREATE INDEX IF NOT EXISTS idx_phone_blacklist_store ON phone_blacklist(store_id);

-- Fraud decision log (audit trail)
CREATE TABLE IF NOT EXISTS fraud_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  decision TEXT NOT NULL,
  signals TEXT,
  resolved_by TEXT,
  resolved_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_fraud_events_store ON fraud_events(store_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_phone ON fraud_events(phone);
CREATE INDEX IF NOT EXISTS idx_fraud_events_order ON fraud_events(order_id);

-- Add fraud_settings column to stores table
ALTER TABLE stores ADD COLUMN fraud_settings TEXT;
