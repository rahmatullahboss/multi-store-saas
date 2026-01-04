-- Migration: Add customerPhone field and make customerEmail optional
-- Date: 2024-01-04

-- Add customerPhone column to orders table
ALTER TABLE orders ADD COLUMN customer_phone TEXT;

-- customerEmail is already nullable in new schema (no action needed for SQLite)
-- SQLite doesn't support ALTER COLUMN, but since we're adding NOT NULL -> NULL,
-- the column already exists and accepts NULL values in SQLite by default
