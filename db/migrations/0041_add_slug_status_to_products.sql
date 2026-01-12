-- Migration: Add slug and status columns to products table
-- These columns exist in real database but were missing in migrations

ALTER TABLE products ADD COLUMN slug TEXT;
ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';
