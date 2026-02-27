-- Migration: 0094_wc_power_layer.sql
-- WooCommerce Power Layer — Plan/Scope System & Abandoned Cart Recovery
-- Adds: scopes, plan, wc_webhook_secret to api_keys
--       wc_cart_sessions table for abandoned cart tracking
--       sms_suppression_list table for SMS opt-out management
--       wc_webhook_events table for async webhook processing
--
-- SAFE: All changes are additive (new columns with defaults, new tables)
-- Run: npm run db:migrate:local && npm run db:migrate:prod

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. api_keys — add WooCommerce plan/scope system
-- ─────────────────────────────────────────────────────────────────────────────

-- Plan/scope system for WooCommerce Power Layer integration
-- free:    'analytics' — read-only analytics & order sync
-- starter: 'analytics,fraud,tracking,courier,abandoned_cart' — full tracking
-- pro:     'analytics,fraud,tracking,courier,abandoned_cart,sms,automation' — with SMS + automation

-- NOTE: 'scopes' column already exists in api_keys (added in 0092_api_platform.sql)
-- Only adding new columns that don't exist yet:

ALTER TABLE api_keys ADD COLUMN plan TEXT DEFAULT 'free';
-- Plan type: 'free' | 'starter' | 'pro' (distinct from plan_id integer FK)

ALTER TABLE api_keys ADD COLUMN wc_webhook_secret TEXT DEFAULT NULL;
-- HMAC secret for verifying WooCommerce webhook signatures (SHA256)

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. wc_cart_sessions — abandoned cart tracking
-- ─────────────────────────────────────────────────────────────────────────────
-- Tracks WooCommerce cart sessions for abandoned cart recovery campaigns.
-- Multi-tenancy: scoped by store_id.
-- Auto-purge: Keep only 30 days (run DELETE WHERE created_at < datetime('now', '-30 days') via cron)

CREATE TABLE IF NOT EXISTS wc_cart_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,                -- WC session ID or cart key
  customer_phone TEXT,                     -- Normalized phone (01XXXXXXXXX)
  customer_email TEXT,                     -- Customer email (optional)
  items TEXT NOT NULL,                     -- JSON array: [{sku, name, qty, price}]
  total REAL NOT NULL DEFAULT 0,           -- Cart total amount
  converted INTEGER NOT NULL DEFAULT 0,    -- Boolean: 1 if abandoned cart converted to order
  converted_at INTEGER,                    -- Unix timestamp when converted
  last_reminder_at INTEGER,                -- Unix timestamp of last reminder sent
  reminder_count INTEGER NOT NULL DEFAULT 0, -- Number of reminders sent
  source TEXT DEFAULT 'woocommerce',       -- 'woocommerce' | 'ozzyl' — where cart came from
  updated_at INTEGER,                      -- Unix timestamp of last update
  created_at INTEGER DEFAULT (unixepoch())
);

-- Composite unique index: one session per store
CREATE UNIQUE INDEX IF NOT EXISTS idx_wc_cart_store_session 
  ON wc_cart_sessions(store_id, session_id);

-- Query: find unconverted carts for a store
CREATE INDEX IF NOT EXISTS idx_wc_cart_store_converted 
  ON wc_cart_sessions(store_id, converted);

-- Query: find carts updated recently (for reminder scheduling)
CREATE INDEX IF NOT EXISTS idx_wc_cart_updated 
  ON wc_cart_sessions(updated_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. sms_suppression_list — SMS opt-out management
-- ─────────────────────────────────────────────────────────────────────────────
-- Tracks phone numbers opted out of SMS marketing.
-- Multi-tenancy: scoped by store_id.
-- Supports 3 sources: customer opt-out, admin blocklist, bounce on failed send.

CREATE TABLE IF NOT EXISTS sms_suppression_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  phone_normalized TEXT NOT NULL,          -- Normalized BD format: 01XXXXXXXXX
  opted_out_at INTEGER DEFAULT (unixepoch()),
  source TEXT DEFAULT 'customer'           -- 'customer' | 'admin' | 'bounce'
);

-- Composite unique index: one entry per store + phone
CREATE UNIQUE INDEX IF NOT EXISTS idx_sms_suppression_store_phone 
  ON sms_suppression_list(store_id, phone_normalized);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. wc_webhook_events — async webhook processing queue
-- ─────────────────────────────────────────────────────────────────────────────
-- Stores incoming WooCommerce webhook events for async processing.
-- Prevents data loss if webhook handler is temporarily unavailable.
-- Auto-purge: Keep processed events for 7 days only.

CREATE TABLE IF NOT EXISTS wc_webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,                     -- WC webhook topic: 'order.created', 'order.updated', etc.
  wc_resource_id TEXT,                     -- WooCommerce resource ID (order_id, customer_id, etc.)
  payload TEXT NOT NULL,                   -- Full webhook payload as JSON
  processed INTEGER NOT NULL DEFAULT 0,    -- Boolean: 1 if event has been processed
  processed_at INTEGER,                    -- Unix timestamp when processed
  created_at INTEGER DEFAULT (unixepoch())
);

-- Query: find unprocessed events for a store
CREATE INDEX IF NOT EXISTS idx_wc_webhook_store_processed 
  ON wc_webhook_events(store_id, processed);

-- Query: cleanup old events (for cron job)
CREATE INDEX IF NOT EXISTS idx_wc_webhook_created 
  ON wc_webhook_events(created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- CLEANUP CRON (run weekly via workers/courier-cron/):
-- ─────────────────────────────────────────────────────────────────────────────
-- DELETE FROM fraud_ip_events WHERE created_at < datetime('now', '-30 days');
-- DELETE FROM fraud_events WHERE created_at < datetime('now', '-90 days');
-- DELETE FROM wc_webhook_events WHERE processed = 1 AND created_at < datetime('now', '-7 days');
-- DELETE FROM wc_cart_sessions WHERE converted = 1 AND created_at < datetime('now', '-30 days');
