-- Multi Store SaaS - D1 Integrity Checks
-- Run after migrations / before go-live.
--
-- Expected: all counts below are 0 (unless otherwise noted).
-- Usage:
--   wrangler d1 execute <db> --remote --file ./scripts/db-integrity-checks.sql

-- ---------------------------------------------------------------------------
-- 0) Basic sanity: tables present
-- ---------------------------------------------------------------------------
SELECT 'table_exists:d1_migrations' AS check_name, EXISTS(
  SELECT 1 FROM sqlite_master WHERE type='table' AND name='d1_migrations'
) AS ok;

SELECT 'table_exists:stores' AS check_name, EXISTS(
  SELECT 1 FROM sqlite_master WHERE type='table' AND name='stores'
) AS ok;

SELECT 'table_exists:products' AS check_name, EXISTS(
  SELECT 1 FROM sqlite_master WHERE type='table' AND name='products'
) AS ok;

SELECT 'table_exists:product_variants' AS check_name, EXISTS(
  SELECT 1 FROM sqlite_master WHERE type='table' AND name='product_variants'
) AS ok;

SELECT 'table_exists:orders' AS check_name, EXISTS(
  SELECT 1 FROM sqlite_master WHERE type='table' AND name='orders'
) AS ok;

SELECT 'table_exists:order_items' AS check_name, EXISTS(
  SELECT 1 FROM sqlite_master WHERE type='table' AND name='order_items'
) AS ok;

SELECT 'table_exists:checkout_sessions' AS check_name, EXISTS(
  SELECT 1 FROM sqlite_master WHERE type='table' AND name='checkout_sessions'
) AS ok;

-- ---------------------------------------------------------------------------
-- 1) Migration tracking (informational)
-- ---------------------------------------------------------------------------
SELECT 'd1_migrations_count' AS check_name, COUNT(*) AS count
FROM d1_migrations;

-- ---------------------------------------------------------------------------
-- 2) Multi-tenant store_id sanity (should be 0)
-- ---------------------------------------------------------------------------
SELECT 'products_null_store_id' AS check_name, COUNT(*) AS count
FROM products
WHERE store_id IS NULL;

SELECT 'customers_null_store_id' AS check_name, COUNT(*) AS count
FROM customers
WHERE store_id IS NULL;

SELECT 'orders_null_store_id' AS check_name, COUNT(*) AS count
FROM orders
WHERE store_id IS NULL;

-- ---------------------------------------------------------------------------
-- 3) Inventory never negative (should be 0)
-- ---------------------------------------------------------------------------
SELECT 'products_negative_inventory' AS check_name, COUNT(*) AS count
FROM products
WHERE inventory < 0;

SELECT 'product_variants_negative_inventory' AS check_name, COUNT(*) AS count
FROM product_variants
WHERE inventory < 0 OR available < 0 OR reserved < 0;

SELECT 'location_inventory_negative' AS check_name, COUNT(*) AS count
FROM location_inventory
WHERE quantity < 0 OR reserved_quantity < 0;

-- ---------------------------------------------------------------------------
-- 4) Orders & items consistency (should be 0)
-- ---------------------------------------------------------------------------
SELECT 'orphan_order_items' AS check_name, COUNT(*) AS count
FROM order_items oi
LEFT JOIN orders o ON o.id = oi.order_id
WHERE o.id IS NULL;

SELECT 'order_items_invalid_quantity' AS check_name, COUNT(*) AS count
FROM order_items
WHERE quantity <= 0;

SELECT 'order_items_invalid_money' AS check_name, COUNT(*) AS count
FROM order_items
WHERE price < 0 OR total < 0;

-- Order item total ~= price * quantity (tolerance 0.01)
SELECT 'order_items_total_mismatch' AS check_name, COUNT(*) AS count
FROM order_items
WHERE ABS(total - (price * quantity)) > 0.01;

-- orders.subtotal should match sum(order_items.total) (tolerance 0.01)
WITH items AS (
  SELECT order_id, ROUND(SUM(total), 2) AS items_total
  FROM order_items
  GROUP BY order_id
)
SELECT 'orders_subtotal_mismatch' AS check_name, COUNT(*) AS count
FROM orders o
JOIN items i ON i.order_id = o.id
WHERE ABS(ROUND(o.subtotal, 2) - i.items_total) > 0.01;

-- orders.total should match subtotal + tax + shipping (tolerance 0.01)
SELECT 'orders_total_mismatch' AS check_name, COUNT(*) AS count
FROM orders
WHERE ABS(
  ROUND(total, 2) - ROUND(subtotal + COALESCE(tax, 0) + COALESCE(shipping, 0), 2)
) > 0.01;

-- ---------------------------------------------------------------------------
-- 5) Idempotency checks (should be 0)
-- ---------------------------------------------------------------------------
SELECT 'checkout_sessions_idempotency_dupes' AS check_name, COUNT(*) AS count
FROM (
  SELECT idempotency_key
  FROM checkout_sessions
  WHERE idempotency_key IS NOT NULL AND idempotency_key != ''
  GROUP BY idempotency_key
  HAVING COUNT(*) > 1
);

-- ---------------------------------------------------------------------------
-- 6) Foreign key violations (expected: no rows)
-- ---------------------------------------------------------------------------
PRAGMA foreign_key_check;
