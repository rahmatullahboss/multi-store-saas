-- Add missing columns to stores table
ALTER TABLE stores ADD COLUMN custom_domain_request TEXT;
ALTER TABLE stores ADD COLUMN custom_domain_requested_at INTEGER;
ALTER TABLE stores ADD COLUMN custom_domain_status TEXT DEFAULT 'none';