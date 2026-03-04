-- Migration: 0097_add_pl_tracking_fields
-- Feature: Profit & Loss Tracking System
-- Date: 2026-03-03
--
-- Adds cost price tracking to products/variants, cost snapshot to order items,
-- and courier charge (merchant-paid) to orders.
--
-- All columns use DEFAULT NULL or DEFAULT 0 to ensure backward compatibility.
-- Existing rows are unaffected.

ALTER TABLE products ADD COLUMN cost_price REAL;
ALTER TABLE product_variants ADD COLUMN cost_price REAL;
ALTER TABLE order_items ADD COLUMN cost_price_snapshot REAL;
ALTER TABLE orders ADD COLUMN courier_charge INTEGER NOT NULL DEFAULT 0;
