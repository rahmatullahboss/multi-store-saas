-- Migration: Add Courier Performance Analytics, Multi-Step Checkout, and GTM Integration
-- Date: 2026-03-04
-- Description: Implements missing features from gap analysis
-- Version: 1.1.0 (Fixed)

-- ============================================================================
-- 1. COURIER PERFORMANCE ANALYTICS
-- ============================================================================

-- Add courier performance tracking table
CREATE TABLE IF NOT EXISTS courier_performance_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  courier TEXT NOT NULL, -- 'pathao', 'redx', 'steadfast', etc.
  shipment_id INTEGER,
  order_id INTEGER,
  
  -- Performance Metrics
  status TEXT, -- 'delivered', 'returned', 'failed', 'in_transit'
  delivery_time_hours INTEGER, -- Hours from pickup to delivery
  attempt_count INTEGER DEFAULT 1, -- Number of delivery attempts
  failure_reason TEXT, -- 'customer_unavailable', 'wrong_address', 'refused', etc.
  delivery_cost REAL, -- Cost charged by courier
  is_successful INTEGER DEFAULT 0, -- Boolean: 1 = successful, 0 = failed
  
  -- Timestamps
  picked_up_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE INDEX idx_courier_perf_store ON courier_performance_logs(store_id);
CREATE INDEX idx_courier_perf_courier ON courier_performance_logs(courier);
CREATE INDEX idx_courier_perf_status ON courier_performance_logs(status);
CREATE INDEX idx_courier_perf_created ON courier_performance_logs(created_at);
-- Added: Composite index for performance queries
CREATE INDEX idx_courier_perf_store_courier_status ON courier_performance_logs(store_id, courier, status);

-- ============================================================================
-- 2. MULTI-STEP CHECKOUT SUPPORT
-- ============================================================================

-- Add checkout format preference to stores table
ALTER TABLE stores ADD COLUMN checkout_format TEXT DEFAULT 'one-page'; -- 'one-page' or 'multi-step'

-- Add checkout step tracking for analytics
CREATE TABLE IF NOT EXISTS checkout_abandonment_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  
  -- Funnel Steps
  reached_step TEXT, -- 'info', 'address', 'payment', 'review', 'completed'
  completed_info INTEGER DEFAULT 0,
  completed_address INTEGER DEFAULT 0,
  completed_payment INTEGER DEFAULT 0,
  completed_review INTEGER DEFAULT 0,
  completed_checkout INTEGER DEFAULT 0,
  
  -- Cart Data
  cart_value REAL,
  cart_items_count INTEGER,
  
  -- Exit Data
  exit_reason TEXT, -- 'shipping_cost', 'payment_issue', 'changed_mind', 'technical_issue'
  exit_page TEXT, -- URL where they abandoned
  
  -- Device/Browser
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  browser TEXT,
  os TEXT,
  
  -- Timestamps
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  abandoned_at TIMESTAMP,
  
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE INDEX idx_checkout_abandon_store ON checkout_abandonment_logs(store_id);
CREATE INDEX idx_checkout_abandon_session ON checkout_abandonment_logs(session_id);
CREATE INDEX idx_checkout_abandon_created ON checkout_abandonment_logs(started_at);
-- Added: Composite index for abandonment queries
CREATE INDEX idx_checkout_abandon_store_completed ON checkout_abandonment_logs(store_id, completed_checkout, started_at);

-- ============================================================================
-- 3. GOOGLE TAG MANAGER INTEGRATION
-- ============================================================================

-- Add GTM container ID to stores table
ALTER TABLE stores ADD COLUMN google_tag_manager_id TEXT;

-- Add GTM events tracking table
CREATE TABLE IF NOT EXISTS gtm_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL, -- 'page_view', 'add_to_cart', 'begin_checkout', 'purchase', 'add_payment_info'
  event_data TEXT, -- JSON: event-specific data (product_id, value, currency, etc.)
  
  -- Customer Context
  customer_id INTEGER,
  is_logged_in INTEGER DEFAULT 0,
  
  -- Page Context
  page_url TEXT,
  page_title TEXT,
  referrer TEXT,
  
  -- E-commerce Data
  product_id INTEGER,
  product_name TEXT,
  value REAL,
  currency TEXT DEFAULT 'BDT',
  transaction_id TEXT,
  
  -- Device/Browser
  device_type TEXT,
  user_agent TEXT,
  ip_address TEXT, -- GDPR: Store anonymized IP only
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE INDEX idx_gtm_events_store ON gtm_events(store_id);
CREATE INDEX idx_gtm_events_session ON gtm_events(session_id);
CREATE INDEX idx_gtm_events_name ON gtm_events(event_name);
CREATE INDEX idx_gtm_events_created ON gtm_events(created_at);
-- Added: Composite index for analytics queries
CREATE INDEX idx_gtm_events_store_event_created ON gtm_events(store_id, event_name, created_at);

-- ============================================================================
-- 4. UPDATE EXISTING TABLES
-- ============================================================================

-- Add courier performance fields to shipments table (for denormalized queries)
ALTER TABLE shipments ADD COLUMN delivery_time_hours INTEGER;
ALTER TABLE shipments ADD COLUMN attempt_count INTEGER DEFAULT 1;
ALTER TABLE shipments ADD COLUMN failure_reason TEXT;
ALTER TABLE shipments ADD COLUMN delivery_cost REAL;
ALTER TABLE shipments ADD COLUMN is_successful INTEGER DEFAULT 0;

-- Add index for courier performance queries
CREATE INDEX idx_shipments_courier_perf ON shipments(courier, status, delivered_at);

-- ============================================================================
-- ROLLBACK SCRIPT (DOWN Migration)
-- Execute this section to rollback if needed
-- ============================================================================

-- DROP INDEX idx_shipments_courier_perf;
-- DROP INDEX idx_gtm_events_store_event_created;
-- DROP INDEX idx_checkout_abandon_store_completed;
-- DROP INDEX idx_courier_perf_store_courier_status;
-- DROP INDEX idx_gtm_events_created;
-- DROP INDEX idx_gtm_events_name;
-- DROP INDEX idx_gtm_events_session;
-- DROP INDEX idx_gtm_events_store;
-- DROP INDEX idx_checkout_abandon_created;
-- DROP INDEX idx_checkout_abandon_session;
-- DROP INDEX idx_checkout_abandon_store;
-- DROP INDEX idx_courier_perf_created;
-- DROP INDEX idx_courier_perf_status;
-- DROP INDEX idx_courier_perf_courier;
-- DROP INDEX idx_courier_perf_store;

-- DROP TABLE IF EXISTS gtm_events;
-- DROP TABLE IF EXISTS checkout_abandonment_logs;
-- DROP TABLE IF EXISTS courier_performance_logs;

-- ALTER TABLE shipments DROP COLUMN is_successful;
-- ALTER TABLE shipments DROP COLUMN delivery_cost;
-- ALTER TABLE shipments DROP COLUMN failure_reason;
-- ALTER TABLE shipments DROP COLUMN attempt_count;
-- ALTER TABLE shipments DROP COLUMN delivery_time_hours;

-- ALTER TABLE stores DROP COLUMN google_tag_manager_id;
-- ALTER TABLE stores DROP COLUMN checkout_format;
