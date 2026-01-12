-- Migration: Add phone column to users table
-- This column exists in real database but was missing in migrations

ALTER TABLE users ADD COLUMN phone TEXT;
