CREATE INDEX IF NOT EXISTS products_store_published_idx ON products(store_id, is_published);
CREATE INDEX IF NOT EXISTS orders_store_created_idx ON orders(store_id, created_at);
CREATE INDEX IF NOT EXISTS page_views_store_created_idx ON page_views(store_id, created_at);

-- Some environments rely on the legacy `abandoned_carts` table (used for recovery + segmentation).
-- `CREATE INDEX` fails if the table doesn't exist, so ensure the table exists first.
-- This table is also defined in the app schema + Drizzle models; keeping it here makes a fresh
-- staging/prod DB able to run all migrations from scratch.
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  cart_items TEXT NOT NULL,
  total_amount REAL NOT NULL,
  currency TEXT DEFAULT 'BDT',
  abandoned_at INTEGER,
  recovered_at INTEGER,
  recovery_email_sent INTEGER DEFAULT 0,
  recovery_email_sent_at INTEGER,
  status TEXT DEFAULT 'abandoned'
);

CREATE INDEX IF NOT EXISTS abandoned_carts_store_abandoned_idx ON abandoned_carts(store_id, abandoned_at);
CREATE INDEX IF NOT EXISTS product_variants_product_available_idx ON product_variants(product_id, is_available);
