-- Migration: Hybrid Mode Architecture
-- Adds store_enabled and home_entry columns to stores table
-- Removes legacy mode column
-- Run this on D1 database

-- Step 1: Add new columns
ALTER TABLE stores ADD COLUMN store_enabled INTEGER DEFAULT 1;
ALTER TABLE stores ADD COLUMN home_entry TEXT DEFAULT 'store_home';

-- Step 2: Migrate existing data based on legacy mode field
-- All stores get store_enabled = 1 (true) by default
-- Limits are enforced via usage_limits, not by disabling features
UPDATE stores SET store_enabled = 1;

-- Step 3: Set home_entry based on old mode
-- If mode was 'landing' and they have a builder page, set it as homepage
UPDATE stores 
SET home_entry = 'page:' || homepage_builder_page_id 
WHERE mode = 'landing' AND homepage_builder_page_id IS NOT NULL;

-- Note: mode column will be dropped in a future migration after code cleanup
-- ALTER TABLE stores DROP COLUMN mode;
