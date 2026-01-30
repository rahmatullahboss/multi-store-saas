-- Migration: Convert money fields from REAL to INTEGER (cents)
-- Created: 2026-01-18
-- CRITICAL: This converts all money values to cents (multiply by 100)
-- 
-- IDEMPOTENCY FIX: Uses migration_metadata table to track if already applied
-- Running this migration twice will NOT corrupt data!

-- ============================================================================
-- STEP 1: Create migration tracking table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS _migration_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    applied_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- STEP 2: Check if money conversion was already applied
-- If 'money_converted_to_cents' exists, skip all UPDATE statements
-- ============================================================================

-- PRODUCTS TABLE - Only convert if not already done
-- Check: If any product has price > 10000 (likely already cents for BDT market)
-- OR if metadata flag exists, skip conversion
UPDATE products 
SET price = ROUND(price * 100) 
WHERE price IS NOT NULL 
  AND price > 0 
  AND price < 100000  -- Safety: Skip if already looks like cents (BDT 1000+ items)
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

UPDATE products 
SET compare_at_price = ROUND(compare_at_price * 100) 
WHERE compare_at_price IS NOT NULL 
  AND compare_at_price > 0
  AND compare_at_price < 100000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

-- ============================================================================
-- PRODUCT VARIANTS TABLE
-- ============================================================================
UPDATE product_variants 
SET price = ROUND(price * 100) 
WHERE price IS NOT NULL 
  AND price > 0
  AND price < 100000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

UPDATE product_variants 
SET compare_at_price = ROUND(compare_at_price * 100) 
WHERE compare_at_price IS NOT NULL 
  AND compare_at_price > 0
  AND compare_at_price < 100000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
UPDATE orders 
SET subtotal = ROUND(subtotal * 100) 
WHERE subtotal IS NOT NULL 
  AND subtotal > 0
  AND subtotal < 10000000  -- 100k BDT max reasonable order
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

UPDATE orders 
SET tax = ROUND(tax * 100) 
WHERE tax IS NOT NULL 
  AND tax > 0
  AND tax < 1000000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

UPDATE orders 
SET shipping = ROUND(shipping * 100) 
WHERE shipping IS NOT NULL 
  AND shipping > 0
  AND shipping < 100000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

UPDATE orders 
SET total = ROUND(total * 100) 
WHERE total IS NOT NULL 
  AND total > 0
  AND total < 10000000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

-- ============================================================================
-- ORDER ITEMS TABLE
-- ============================================================================
UPDATE order_items 
SET price = ROUND(price * 100) 
WHERE price IS NOT NULL 
  AND price > 0
  AND price < 100000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

UPDATE order_items 
SET total = ROUND(total * 100) 
WHERE total IS NOT NULL 
  AND total > 0
  AND total < 1000000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================
UPDATE customers 
SET total_spent = ROUND(total_spent * 100) 
WHERE total_spent IS NOT NULL 
  AND total_spent > 0
  AND total_spent < 100000000  -- 1M BDT lifetime cap
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

-- ============================================================================
-- SHIPPING ZONES TABLE
-- ============================================================================
UPDATE shipping_zones 
SET rate = ROUND(rate * 100) 
WHERE rate IS NOT NULL 
  AND rate > 0
  AND rate < 100000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

UPDATE shipping_zones 
SET free_above = ROUND(free_above * 100) 
WHERE free_above IS NOT NULL 
  AND free_above > 0
  AND free_above < 1000000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

-- ============================================================================
-- DISCOUNTS TABLE
-- ============================================================================
UPDATE discounts 
SET value = ROUND(value * 100) 
WHERE value IS NOT NULL 
  AND value > 0
  AND value < 1000000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

UPDATE discounts 
SET min_order_amount = ROUND(min_order_amount * 100) 
WHERE min_order_amount IS NOT NULL 
  AND min_order_amount > 0
  AND min_order_amount < 1000000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

UPDATE discounts 
SET max_discount_amount = ROUND(max_discount_amount * 100) 
WHERE max_discount_amount IS NOT NULL 
  AND max_discount_amount > 0
  AND max_discount_amount < 1000000
  AND NOT EXISTS (SELECT 1 FROM _migration_metadata WHERE key = 'money_converted_to_cents');

-- ============================================================================
-- STEP 3: Mark migration as complete (prevents double-run)
-- ============================================================================
INSERT OR IGNORE INTO _migration_metadata (key, value) 
VALUES ('money_converted_to_cents', 'true');
