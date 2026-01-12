-- Migration: Add page_config column to landing_pages
-- This column was missing in previous migrations but is required by the current schema.

ALTER TABLE landing_pages ADD COLUMN page_config TEXT;
