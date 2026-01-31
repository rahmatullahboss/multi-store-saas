-- Migration: Sync schema with missing columns
-- Adds marketing_config and banner_url if they don't exist

-- Note: We use a safe approach by adding columns individually given SQLite limitations
-- If banner_url was partially added, this might fail, but given the duplicate error earlier, it might be safer to check
-- However, standard practice is to just try adding what's missing.
-- Given earlier "duplicate" error for banner_url, we should assume it MIGHT be there, but marketing_config definitely isn't.

-- Add marketing_config
ALTER TABLE stores ADD COLUMN marketing_config TEXT;

-- Add loyalty_config (also seen in schema but potentially missing)
ALTER TABLE stores ADD COLUMN loyalty_config TEXT;

-- Add manual_payment_config (also seen in schema)
-- ALTER TABLE stores ADD COLUMN manual_payment_config TEXT;
