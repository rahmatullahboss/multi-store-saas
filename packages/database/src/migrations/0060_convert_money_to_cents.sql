-- Migration: Convert money fields from REAL to INTEGER (cents)
-- Created: 2026-01-18
-- CRITICAL: This converts all money values to cents (multiply by 100)
-- MINIMAL version - only core tables that definitely exist

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
UPDATE products SET price = ROUND(price * 100) WHERE price IS NOT NULL;
UPDATE products SET compare_at_price = ROUND(compare_at_price * 100) WHERE compare_at_price IS NOT NULL;

-- ============================================================================
-- PRODUCT VARIANTS TABLE
-- ============================================================================
UPDATE product_variants SET price = ROUND(price * 100) WHERE price IS NOT NULL;
UPDATE product_variants SET compare_at_price = ROUND(compare_at_price * 100) WHERE compare_at_price IS NOT NULL;

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
UPDATE orders SET subtotal = ROUND(subtotal * 100) WHERE subtotal IS NOT NULL;
UPDATE orders SET tax = ROUND(tax * 100) WHERE tax IS NOT NULL;
UPDATE orders SET shipping = ROUND(shipping * 100) WHERE shipping IS NOT NULL;
UPDATE orders SET total = ROUND(total * 100) WHERE total IS NOT NULL;

-- ============================================================================
-- ORDER ITEMS TABLE
-- ============================================================================
UPDATE order_items SET price = ROUND(price * 100) WHERE price IS NOT NULL;
UPDATE order_items SET total = ROUND(total * 100) WHERE total IS NOT NULL;

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================
UPDATE customers SET total_spent = ROUND(total_spent * 100) WHERE total_spent IS NOT NULL;

-- ============================================================================
-- SHIPPING ZONES TABLE
-- ============================================================================
UPDATE shipping_zones SET rate = ROUND(rate * 100) WHERE rate IS NOT NULL;
UPDATE shipping_zones SET free_above = ROUND(free_above * 100) WHERE free_above IS NOT NULL;

-- ============================================================================
-- DISCOUNTS TABLE
-- ============================================================================
UPDATE discounts SET value = ROUND(value * 100) WHERE value IS NOT NULL;
UPDATE discounts SET min_order_amount = ROUND(min_order_amount * 100) WHERE min_order_amount IS NOT NULL;
UPDATE discounts SET max_discount_amount = ROUND(max_discount_amount * 100) WHERE max_discount_amount IS NOT NULL;
