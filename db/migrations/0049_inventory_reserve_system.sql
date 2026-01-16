-- Migration: P1 - Inventory Reserve System
-- 
-- Adds available/reserved columns to prevent overselling during checkout.
-- 
-- Flow:
-- 1. Checkout start → reserved += qty, available -= qty
-- 2. Order complete → reserved -= qty (inventory already deducted)
-- 3. Order cancel/expire → available += qty, reserved -= qty

-- Columns already exist in production, commenting out to prevent duplicate errors
-- ALTER TABLE product_variants ADD COLUMN available INTEGER DEFAULT 0;
-- ALTER TABLE product_variants ADD COLUMN reserved INTEGER DEFAULT 0;

-- Initialize: Set available = current inventory for existing variants (already done)
-- UPDATE product_variants SET available = inventory WHERE available = 0;

-- Add index for fast inventory checks
CREATE INDEX IF NOT EXISTS idx_product_variants_inventory 
ON product_variants(product_id, available);
