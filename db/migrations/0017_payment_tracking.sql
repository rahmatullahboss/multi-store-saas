-- Migration: Add payment tracking columns for subscription verification
-- This enables manual bKash payment verification during onboarding

ALTER TABLE stores ADD COLUMN payment_transaction_id TEXT;
ALTER TABLE stores ADD COLUMN payment_status TEXT DEFAULT 'none';
ALTER TABLE stores ADD COLUMN payment_submitted_at INTEGER;
ALTER TABLE stores ADD COLUMN payment_amount REAL;
ALTER TABLE stores ADD COLUMN payment_phone TEXT;
