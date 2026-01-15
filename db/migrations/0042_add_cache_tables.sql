-- D1 Performance Optimization: Cache Tables
-- Phase 22: Edge Caching for Tenant Resolution and Store Config

-- Cache Store: General purpose key-value cache
CREATE TABLE IF NOT EXISTS cache_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_store(expires_at);

-- AI Cache: Dedicated cache for AI responses
CREATE TABLE IF NOT EXISTS ai_cache (
  key TEXT PRIMARY KEY,
  response TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_cache(expires_at);
