-- Migration: Add banner_url column to stores table
-- This column was missing in production but existed in the schema
-- Used for storing store banner image URLs

-- ALTER TABLE stores ADD COLUMN banner_url TEXT;