-- Migration: Convert prices from poisha (cents) to taka
-- This divides all price columns by 100 to convert from 150000 to 1500

-- Products table
UPDATE products SET price = price / 100 WHERE price > 1000;
UPDATE products SET compare_at_price = compare_at_price / 100 WHERE compare_at_price > 1000;

-- Product variants
UPDATE product_variants SET price = price / 100 WHERE price > 1000;
UPDATE product_variants SET compare_at_price = compare_at_price / 100 WHERE compare_at_price > 1000;

-- Orders
UPDATE orders SET subtotal = subtotal / 100 WHERE subtotal > 1000;
UPDATE orders SET tax = tax / 100 WHERE tax > 1000;
UPDATE orders SET shipping = shipping / 100 WHERE shipping > 1000;
UPDATE orders SET total = total / 100 WHERE total > 1000;

-- Order items
UPDATE order_items SET price = price / 100 WHERE price > 1000;
UPDATE order_items SET total = total / 100 WHERE total > 1000;

-- Customers
UPDATE customers SET total_spent = total_spent / 100 WHERE total_spent > 1000;

-- Shipping zones
UPDATE shipping_zones SET rate = rate / 100 WHERE rate > 1000;
UPDATE shipping_zones SET free_above = free_above / 100 WHERE free_above > 1000;

-- Discounts
UPDATE discounts SET value = value / 100 WHERE type = 'fixed' AND value > 1000;
UPDATE discounts SET min_order_amount = min_order_amount / 100 WHERE min_order_amount > 1000;
UPDATE discounts SET max_discount_amount = max_discount_amount / 100 WHERE max_discount_amount > 1000;

-- Payouts
UPDATE payouts SET gross_amount = gross_amount / 100 WHERE gross_amount > 1000;
UPDATE payouts SET platform_fee = platform_fee / 100 WHERE platform_fee > 1000;
UPDATE payouts SET net_amount = net_amount / 100 WHERE net_amount > 1000;

-- Abandoned carts
UPDATE abandoned_carts SET total_amount = total_amount / 100 WHERE total_amount > 1000;

-- Saved landing configs
UPDATE saved_landing_configs SET revenue = revenue / 100 WHERE revenue > 1000;

-- Upsell offers
UPDATE upsell_offers SET revenue = revenue / 100 WHERE revenue > 1000;

-- Saas coupons (fixed type only)
UPDATE saas_coupons SET discount_amount = discount_amount / 100 WHERE discount_type = 'fixed' AND discount_amount > 1000;

-- Stores payment
UPDATE stores SET payment_amount = payment_amount / 100 WHERE payment_amount > 1000;
