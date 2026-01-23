-- Migration: 0006_subscription_tiers.sql
-- Description: Add subscription status and usage limits for 4-tier plan system

-- Add subscription status column
ALTER TABLE stores ADD COLUMN subscription_status TEXT DEFAULT 'active';

-- Add usage limits cache (JSON format)
ALTER TABLE stores ADD COLUMN usage_limits TEXT;

-- Migrate existing plan types: pro -> premium, enterprise -> custom
UPDATE stores SET plan_type = 'premium' WHERE plan_type = 'pro';
UPDATE stores SET plan_type = 'custom' WHERE plan_type = 'enterprise';
