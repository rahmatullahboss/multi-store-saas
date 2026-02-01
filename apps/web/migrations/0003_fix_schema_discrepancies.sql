-- Migration: Fix schema discrepancies
-- 1. Add missing 'platform_config' to agents table
ALTER TABLE agents ADD COLUMN platform_config TEXT;

-- 2. Add missing 'metadata' to messages table (replacing loose function fields in newer schema)
ALTER TABLE messages ADD COLUMN metadata TEXT;
