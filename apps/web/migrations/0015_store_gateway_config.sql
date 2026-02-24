-- Migration: Add gateway_config column to stores table
-- Stores per-store payment gateway credentials (SSLCommerz, bKash Gateway, Nagad Gateway)
-- Platform-level credentials remain in Cloudflare env secrets as fallback

ALTER TABLE stores ADD COLUMN gateway_config TEXT DEFAULT NULL;

-- gateway_config JSON structure:
-- {
--   "sslcommerz": {
--     "enabled": true,
--     "useOwn": false,          -- false = use platform credentials
--     "storeId": "...",         -- only if useOwn = true
--     "storePassword": "...",   -- only if useOwn = true
--     "isLive": true
--   },
--   "bkash": {
--     "enabled": false,
--     "appKey": "...",
--     "appSecret": "...",
--     "username": "...",
--     "password": "...",
--     "isLive": false
--   },
--   "nagad": {
--     "enabled": false,
--     "merchantId": "...",
--     "merchantPrivateKey": "...",
--     "isLive": false
--   }
-- }
