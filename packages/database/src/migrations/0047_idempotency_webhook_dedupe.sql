-- Migration: P0 Critical Fixes - Idempotency and Webhook Dedupe
-- 
-- This migration adds:
-- 1. webhook_events table for idempotent webhook processing
-- 2. idempotency_key to orders table to prevent duplicate orders

-- ===========================================================================
-- WEBHOOK EVENTS TABLE - Idempotent Webhook Processing
-- ===========================================================================
-- Stores processed webhook events to prevent duplicate processing.
-- Providers: stripe, bkash, steadfast, pathao, redx

CREATE TABLE IF NOT EXISTS webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,  -- 'stripe' | 'bkash' | 'steadfast' | 'pathao' | 'redx'
  event_id TEXT NOT NULL,  -- Provider's unique event ID
  event_type TEXT,         -- e.g., 'payment_intent.succeeded'
  payload_json TEXT,       -- Full webhook payload for debugging
  status TEXT DEFAULT 'processed',  -- 'processed' | 'failed' | 'skipped'
  processed_at INTEGER,    -- When we processed this event (timestamp)
  created_at INTEGER DEFAULT (unixepoch())
);

-- Unique constraint: each provider+event_id should only be processed once
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_unique 
ON webhook_events(provider, event_id);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_store 
ON webhook_events(store_id, created_at);

-- ===========================================================================
-- ADD IDEMPOTENCY KEY TO ORDERS
-- ===========================================================================
-- Prevents duplicate order creation from retried checkout submissions

-- Column already exists in production, commenting out
-- ALTER TABLE orders ADD COLUMN idempotency_key TEXT;

-- Unique index for idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency 
ON orders(store_id, idempotency_key);
