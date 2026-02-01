-- Migration: Add 'type' column to agents table
ALTER TABLE agents ADD COLUMN type TEXT DEFAULT 'ecommerce';
