-- Migration: Add Hybrid Mode fields to stores table
-- Created: 2024-12-30

-- Add mode field (landing page vs full store)
ALTER TABLE stores ADD COLUMN mode TEXT DEFAULT 'store';

-- Add featured product ID for landing mode
ALTER TABLE stores ADD COLUMN featured_product_id INTEGER REFERENCES products(id);

-- Add landing page configuration (JSON)
ALTER TABLE stores ADD COLUMN landing_config TEXT;

-- Add theme configuration for full store (JSON)
ALTER TABLE stores ADD COLUMN theme_config TEXT;

-- Create index for mode-based queries
CREATE INDEX IF NOT EXISTS idx_stores_mode ON stores(mode);
