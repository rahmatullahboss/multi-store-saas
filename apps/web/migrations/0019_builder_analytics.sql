-- Migration: 0019_builder_analytics.sql
-- Date: 2026-02-18
-- Description: Builder page analytics — event ingestion, daily aggregates, section heatmap.
-- All tables are scoped by store_id for multi-tenant isolation.

-- ============================================================================
-- RAW EVENTS TABLE
-- Stores individual analytics events from published pages.
-- High-volume table; retained for ~90 days then archived/pruned.
-- ============================================================================
CREATE TABLE IF NOT EXISTS builder_page_events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id      TEXT    NOT NULL,
  store_id     INTEGER NOT NULL,
  event_type   TEXT    NOT NULL CHECK(event_type IN (
                 'pageview', 'section_view', 'cta_click', 'form_submit', 'scroll_depth'
               )),
  session_id   TEXT    NOT NULL,        -- client-generated UUID per browser session
  visitor_id   TEXT,                    -- HMAC-SHA256(IP+UA) → first 16 hex chars (privacy-safe)
  section_id   TEXT,                    -- for section_view / cta_click events
  section_type TEXT,                    -- section component type (for heatmap grouping)
  scroll_depth INTEGER,                 -- 0-100 percentage (for scroll_depth events)
  device_type  TEXT    CHECK(device_type IN ('mobile', 'tablet', 'desktop')),
  referrer     TEXT,
  country      TEXT,                    -- from CF-IPCountry header
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Fast per-page dashboard queries
CREATE INDEX IF NOT EXISTS idx_builder_events_page
  ON builder_page_events(page_id, store_id, created_at);

-- Per-store overview queries
CREATE INDEX IF NOT EXISTS idx_builder_events_store
  ON builder_page_events(store_id, created_at);

-- ============================================================================
-- DAILY AGGREGATE TABLE
-- Pre-aggregated stats per page per day — powers the analytics dashboard.
-- Updated atomically in the same D1 batch as event insertion.
-- ============================================================================
CREATE TABLE IF NOT EXISTS builder_page_daily_stats (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id          TEXT    NOT NULL,
  store_id         INTEGER NOT NULL,
  date             TEXT    NOT NULL,    -- YYYY-MM-DD
  total_views      INTEGER DEFAULT 0,
  unique_visitors  INTEGER DEFAULT 0,
  mobile_views     INTEGER DEFAULT 0,
  tablet_views     INTEGER DEFAULT 0,
  desktop_views    INTEGER DEFAULT 0,
  avg_scroll_depth REAL    DEFAULT 0,
  cta_clicks       INTEGER DEFAULT 0,
  form_submits     INTEGER DEFAULT 0,
  UNIQUE(page_id, date)
);

CREATE INDEX IF NOT EXISTS idx_builder_daily_page
  ON builder_page_daily_stats(page_id, date);

CREATE INDEX IF NOT EXISTS idx_builder_daily_store
  ON builder_page_daily_stats(store_id, date);

-- ============================================================================
-- SECTION HEATMAP TABLE
-- Per-section engagement stats aggregated daily.
-- ============================================================================
CREATE TABLE IF NOT EXISTS builder_section_stats (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id          TEXT    NOT NULL,
  store_id         INTEGER NOT NULL,
  section_id       TEXT    NOT NULL,
  section_type     TEXT    NOT NULL,
  view_count       INTEGER DEFAULT 0,
  click_count      INTEGER DEFAULT 0,
  avg_time_visible REAL    DEFAULT 0,
  date             TEXT    NOT NULL,   -- YYYY-MM-DD
  UNIQUE(page_id, section_id, date)
);

CREATE INDEX IF NOT EXISTS idx_builder_section_page
  ON builder_section_stats(page_id, date);
