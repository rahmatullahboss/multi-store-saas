-- Migration: Add customer risk score fields for fraud check caching
-- Created: 2026-01-06

ALTER TABLE customers ADD COLUMN risk_score INTEGER;
ALTER TABLE customers ADD COLUMN risk_checked_at INTEGER;
