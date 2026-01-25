-- Migration: Add Missing Published Props Columns
-- Date: 2026-01-25
-- Description: Adds published_props_json and published_at to builder_sections. 
-- These were commented out in 0048 but are required locally.

ALTER TABLE builder_sections ADD COLUMN published_props_json TEXT;
ALTER TABLE builder_sections ADD COLUMN published_at INTEGER;
