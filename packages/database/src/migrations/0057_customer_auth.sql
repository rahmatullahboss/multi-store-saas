-- Migration: Add customer authentication fields
-- Enables Google Sign-In for storefront customers (All plans via shared OAuth, Premium can use custom)

-- Add authentication columns to customers table
-- NOTE:
-- Fresh DBs get these columns via `0046_material_legion.sql` (table rebuild).
-- Re-adding here can fail with "duplicate column name" depending on migration order.
-- If you are baselining/stamping migrations for an existing production DB, ensure the
-- customers table already contains these columns.
-- ALTER TABLE customers ADD COLUMN password_hash TEXT;
-- ALTER TABLE customers ADD COLUMN google_id TEXT;
-- ALTER TABLE customers ADD COLUMN auth_provider TEXT DEFAULT 'email';
-- ALTER TABLE customers ADD COLUMN last_login_at INTEGER;

-- Create index for Google ID lookups
CREATE INDEX IF NOT EXISTS customers_google_id_idx ON customers(store_id, google_id);

-- Add custom OAuth columns to stores table (Premium/Business feature)
ALTER TABLE stores ADD COLUMN custom_google_client_id TEXT;
ALTER TABLE stores ADD COLUMN custom_google_client_secret TEXT;
