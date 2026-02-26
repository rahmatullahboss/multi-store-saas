-- Migration: 0018_page_analytics.sql
-- Date: 2026-02-18
-- Description: Create page_analytics table for Phase 6 conversion tracking.
--
-- Tracks per-page events (views, CTA clicks, scroll depth, section visibility)
-- scoped by store_id for multi-tenant isolation.
-- id uses a random hex string (8 bytes = 16 hex chars) to avoid sequential IDs.

CREATE TABLE IF NOT EXISTS page_analytics (
  id          TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  page_id     TEXT    NOT NULL REFERENCES builder_pages(id) ON DELETE CASCADE,
  store_id    INTEGER NOT NULL,
  event_type  TEXT    NOT NULL CHECK(event_type IN (
                'view', 'click', 'cta_click',
                'scroll_50', 'scroll_75', 'scroll_100',
                'section_view'
              )),
  section_id  TEXT,
  session_id  TEXT    NOT NULL,
  device_type TEXT    CHECK(device_type IN ('mobile', 'tablet', 'desktop')),
  country     TEXT,
  referrer    TEXT,
  metadata    TEXT,   -- JSON blob for extra event-specific data
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Composite index for per-page event queries (dashboard charts)
CREATE INDEX IF NOT EXISTS idx_page_analytics_page_event
  ON page_analytics(page_id, event_type, created_at DESC);

-- Composite index for per-store analytics overview
CREATE INDEX IF NOT EXISTS idx_page_analytics_store
  ON page_analytics(store_id, created_at DESC);
