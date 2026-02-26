-- Migration: 0016_api_platform.sql
-- Ozzyl API Platform — Phase 1 Foundation
-- Adds: plan_id + expiresAt to api_keys
--       events JSON array to webhooks
--       api_plans + api_subscriptions tables
--
-- SAFE: All changes are additive (new columns with defaults, new tables)
-- Run: npm run db:migrate:local && npm run db:migrate:prod

-- ─── 1. api_keys — add plan_id + expiresAt ───────────────────────────────────

ALTER TABLE api_keys ADD COLUMN plan_id INTEGER REFERENCES api_plans(id) ON DELETE SET NULL;
ALTER TABLE api_keys ADD COLUMN expires_at INTEGER; -- Unix timestamp (mode: timestamp)

-- ─── 2. webhooks — add events JSON array (multi-topic support) ───────────────

ALTER TABLE webhooks ADD COLUMN events TEXT; -- JSON array: ["order/created","product/updated"]
ALTER TABLE webhooks ADD COLUMN updated_at INTEGER DEFAULT (unixepoch());

-- ─── 3. api_plans — subscription plans ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_plans (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  name               TEXT NOT NULL,                        -- "Free", "Starter", "Pro", "Agency"
  slug               TEXT NOT NULL UNIQUE,                 -- "free", "starter", "pro", "agency"
  price_paisa        INTEGER NOT NULL DEFAULT 0,           -- Price in paisa (0 = free)
  -- NOTE: price_paisa / 100 = price in BDT (e.g. 99900 paisa = ৳999)
  trial_days         INTEGER NOT NULL DEFAULT 0,
  requests_per_min   INTEGER NOT NULL DEFAULT 30,
  requests_per_day   INTEGER NOT NULL DEFAULT 1000,
  max_webhooks       INTEGER NOT NULL DEFAULT 2,
  allowed_scopes     TEXT NOT NULL DEFAULT '["read_orders","read_products"]', -- JSON array
  is_active          INTEGER NOT NULL DEFAULT 1,           -- Boolean
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Seed default plans
INSERT OR IGNORE INTO api_plans (name, slug, price_paisa, trial_days, requests_per_min, requests_per_day, max_webhooks, allowed_scopes) VALUES
  ('Free',    'free',    0,      0,  30,   1000,    2,  '["read_orders","read_products","read_analytics"]'),
  ('Starter', 'starter', 99900,  14, 100,  10000,   5,  '["read_orders","write_orders","read_products","write_products","read_analytics","read_customers"]'),
  ('Pro',     'pro',     299900, 14, 500,  100000,  20, '["read_orders","write_orders","read_products","write_products","read_analytics","read_customers","write_customers","read_inventory","write_inventory"]'),
  ('Agency',  'agency',  999900, 0,  2000, 1000000, 50, '["*"]');

-- ─── 4. api_subscriptions — which store is on which plan ─────────────────────

CREATE TABLE IF NOT EXISTS api_subscriptions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id     INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  plan_id      INTEGER NOT NULL REFERENCES api_plans(id),
  status       TEXT NOT NULL DEFAULT 'active', -- 'active' | 'cancelled' | 'past_due' | 'trialing'
  trial_ends   INTEGER,                         -- Unix timestamp
  current_period_start INTEGER,
  current_period_end   INTEGER,
  cancelled_at INTEGER,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_subscriptions_store ON api_subscriptions(store_id);
CREATE INDEX IF NOT EXISTS idx_api_subscriptions_plan ON api_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_api_subscriptions_status ON api_subscriptions(status);

-- ─── 5. Indexes for api_keys (new columns) ────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_api_keys_plan ON api_keys(plan_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires ON api_keys(expires_at) WHERE expires_at IS NOT NULL;
