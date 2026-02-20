-- Migration: 0012_loyalty_reference_id.sql
-- Adds the missing reference_id column to loyalty_transactions table
-- This column links a loyalty transaction to an order or other entity

ALTER TABLE loyalty_transactions ADD COLUMN reference_id TEXT;

CREATE INDEX IF NOT EXISTS idx_loyalty_tx_reference ON loyalty_transactions(reference_id);
