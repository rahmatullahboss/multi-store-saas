-- Add missing columns to stores table
-- Note: These columns may already exist in production
-- ALTER TABLE stores ADD COLUMN custom_domain_request TEXT;
-- ALTER TABLE stores ADD COLUMN custom_domain_requested_at INTEGER;
-- ALTER TABLE stores ADD COLUMN custom_domain_status TEXT DEFAULT 'none';
SELECT 1;