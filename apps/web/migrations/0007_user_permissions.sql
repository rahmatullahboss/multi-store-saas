-- Migration: Add permissions field to users table
-- Allows granular access control for team members

ALTER TABLE users ADD COLUMN permissions TEXT;

-- Default permissions hint (not enforced in DB, handled by app):
-- { "products": true, "orders": true, "customers": true, "analytics": true, 
--   "settings": false, "team": false, "billing": false, "coupons": true }
