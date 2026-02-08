-- Migration: Add credit_purchases table for manual bKash payment verification
-- This enables manual payment approval workflow for AI credit purchases

CREATE TABLE IF NOT EXISTS credit_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- Package info
  package_id TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  
  -- Payment info (bKash)
  transaction_id TEXT,
  phone TEXT,
  
  -- Approval status
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at INTEGER,
  
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_purchases_store ON credit_purchases(store_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(status);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_created ON credit_purchases(created_at);
