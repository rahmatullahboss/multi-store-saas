-- Migration: Add customer authentication fields
-- Enables Google Sign-In for storefront customers (All plans via shared OAuth, Premium can use custom)

-- Add authentication columns to customers table
ALTER TABLE customers ADD COLUMN password_hash TEXT;
ALTER TABLE customers ADD COLUMN google_id TEXT;
ALTER TABLE customers ADD COLUMN auth_provider TEXT DEFAULT 'email';
ALTER TABLE customers ADD COLUMN last_login_at INTEGER;

-- Create index for Google ID lookups
CREATE INDEX IF NOT EXISTS customers_google_id_idx ON customers(store_id, google_id);

-- Add custom OAuth columns to stores table (Premium/Business feature)
ALTER TABLE stores ADD COLUMN custom_google_client_id TEXT;
ALTER TABLE stores ADD COLUMN custom_google_client_secret TEXT;
