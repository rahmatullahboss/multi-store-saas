-- Migration: 0013_fraud_ip_events.sql
-- Phase 1C: IP velocity tracking for fraud ring detection
-- Records IP → phone mappings to detect multiple phones from same IP (fraud rings).
-- Also used for Cloudflare edge signals (country, device type).

CREATE TABLE IF NOT EXISTS fraud_ip_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    cf_country TEXT,          -- CF-IPCountry header (e.g. 'BD', 'IN')
    cf_device_type TEXT,      -- CF-Device-Type header (e.g. 'mobile', 'desktop')
    user_agent TEXT,          -- User-Agent header (first 512 chars)
    risk_score INTEGER,       -- Score at time of this event
    decision TEXT,            -- 'allow' | 'verify' | 'hold' | 'block'
    created_at INTEGER DEFAULT (unixepoch())
);

-- Index for IP velocity queries (primary use case)
CREATE INDEX IF NOT EXISTS idx_fraud_ip_events_ip ON fraud_ip_events(ip_address);

-- Index for per-store queries
CREATE INDEX IF NOT EXISTS idx_fraud_ip_events_store ON fraud_ip_events(store_id);

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_fraud_ip_events_phone ON fraud_ip_events(phone);

-- Composite index for IP + time range queries
CREATE INDEX IF NOT EXISTS idx_fraud_ip_events_ip_created ON fraud_ip_events(ip_address, created_at);

-- Auto-cleanup: keep only last 30 days of IP events (run via cron or manual cleanup)
-- This prevents unbounded table growth.
-- To purge old records: DELETE FROM fraud_ip_events WHERE created_at < unixepoch() - 2592000;
