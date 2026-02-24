-- Migration: 0014_fdaas_api_keys.sql
-- Phase 2: Fraud Detection as a Service (FDaaS)
-- API key management for external merchants (WordPress, Shopify, custom sites)
-- who want to use Ozzyl Guard fraud detection via a paid/freemium API.

CREATE TABLE IF NOT EXISTS fdaas_api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_hash TEXT NOT NULL UNIQUE,   -- SHA-256 hash of the API key (never store raw)
    key_prefix TEXT NOT NULL,        -- First 8 chars of key for display (e.g. "ozg_1a2b")
    name TEXT NOT NULL,              -- Label set by owner (e.g. "My WooCommerce Store")
    owner_email TEXT NOT NULL,       -- Owner contact email
    plan TEXT NOT NULL DEFAULT 'free', -- 'free' | 'starter' | 'pro' | 'enterprise'
    monthly_limit INTEGER NOT NULL DEFAULT 100,  -- Free: 100/mo, Starter: 5000/mo, etc.
    calls_this_month INTEGER NOT NULL DEFAULT 0, -- Counter reset monthly
    calls_total INTEGER NOT NULL DEFAULT 0,      -- Lifetime call count
    last_reset_at INTEGER,           -- Unix timestamp of last monthly counter reset
    last_used_at INTEGER,            -- Unix timestamp of last API call
    is_active INTEGER NOT NULL DEFAULT 1, -- 0 = revoked/suspended
    metadata TEXT,                   -- JSON: webhook_url, allowed_origins, etc.
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_fdaas_api_keys_hash ON fdaas_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_fdaas_api_keys_email ON fdaas_api_keys(owner_email);
CREATE INDEX IF NOT EXISTS idx_fdaas_api_keys_prefix ON fdaas_api_keys(key_prefix);

-- FDaaS usage log for billing and analytics
CREATE TABLE IF NOT EXISTS fdaas_usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL REFERENCES fdaas_api_keys(id) ON DELETE CASCADE,
    phone_hash TEXT NOT NULL,        -- SHA-256 of normalized phone (privacy — never raw)
    risk_score INTEGER,              -- 0-100
    decision TEXT,                   -- 'allow' | 'verify' | 'hold' | 'block'
    response_ms INTEGER,             -- Response time in milliseconds
    ip_address TEXT,                 -- Caller's IP for abuse detection
    created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_fdaas_usage_key ON fdaas_usage_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_fdaas_usage_created ON fdaas_usage_log(created_at);
