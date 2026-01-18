-- Migration: Add shop_domains table for multi-domain support per store
-- Allows stores to connect multiple custom domains

CREATE TABLE IF NOT EXISTS shop_domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_primary INTEGER DEFAULT 0, -- 1 = primary domain for the store
  ssl_status TEXT DEFAULT 'pending', -- pending, provisioning, active, failed
  verified_at INTEGER, -- Timestamp when domain was verified
  dns_verified INTEGER DEFAULT 0, -- 1 = DNS verification passed
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shop_domains_store ON shop_domains(store_id);
CREATE INDEX IF NOT EXISTS idx_shop_domains_domain ON shop_domains(domain);
