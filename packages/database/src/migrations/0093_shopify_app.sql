-- Migration: 0093_shopify_app.sql
-- Phase 4: Shopify App Integration
-- Adds: shopify_installations table for OAuth token storage
--
-- SAFE: New table only — no changes to existing tables
-- Run: npm run db:migrate:local && npm run db:migrate:prod

CREATE TABLE IF NOT EXISTS shopify_installations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_domain TEXT NOT NULL UNIQUE,
  store_id INTEGER REFERENCES stores(id),
  access_token_encrypted TEXT NOT NULL,
  access_token_iv TEXT NOT NULL,
  scopes TEXT NOT NULL,
  installed_at INTEGER,
  uninstalled_at INTEGER,
  webhooks_registered INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_shopify_shop_domain ON shopify_installations(shop_domain);
CREATE INDEX IF NOT EXISTS idx_shopify_store_id ON shopify_installations(store_id);
