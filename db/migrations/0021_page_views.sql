-- Page Views table for visitor analytics
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS page_views_store_idx ON page_views(store_id);
CREATE INDEX IF NOT EXISTS page_views_date_idx ON page_views(store_id, created_at);
CREATE INDEX IF NOT EXISTS page_views_visitor_idx ON page_views(store_id, visitor_id);
