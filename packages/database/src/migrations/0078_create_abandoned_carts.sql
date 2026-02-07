-- Ensure `abandoned_carts` exists on fresh databases.
-- Production already has this table; this migration is safe because it uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  store_id INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  cart_items TEXT NOT NULL,
  total_amount REAL NOT NULL,
  currency TEXT DEFAULT 'BDT',
  abandoned_at INTEGER,
  recovered_at INTEGER,
  recovery_email_sent INTEGER DEFAULT false,
  recovery_email_sent_at INTEGER,
  status TEXT DEFAULT 'abandoned',
  FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade
);

-- Common access patterns
CREATE INDEX IF NOT EXISTS abandoned_carts_store_id_idx ON abandoned_carts(store_id);
CREATE INDEX IF NOT EXISTS abandoned_carts_session_idx ON abandoned_carts(session_id);
CREATE INDEX IF NOT EXISTS abandoned_carts_status_idx ON abandoned_carts(store_id, status);

