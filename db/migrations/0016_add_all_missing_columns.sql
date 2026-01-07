-- Migration: Add only columns that are not already present
-- Note: Many columns already added in previous migrations (0012, 0013, 0014, 0015)
-- Only add truly new columns here

ALTER TABLE stores ADD COLUMN default_language TEXT DEFAULT 'en';