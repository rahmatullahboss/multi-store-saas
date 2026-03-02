-- ============================================================================
-- Migration: Add missing indexes on product_collections junction table
-- Date: 2026-03-01
-- Reason: product_collections is a high-frequency join table (product pages,
--         collection pages, collection product counts) with zero indexes,
--         causing full table scans on every join.
-- ============================================================================

-- Create product_collections table if it doesn't exist
-- (table may already exist in production from an earlier manual migration)
CREATE TABLE IF NOT EXISTS `product_collections` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `product_id` integer NOT NULL REFERENCES `products`(`id`) ON DELETE CASCADE,
  `collection_id` integer NOT NULL REFERENCES `collections`(`id`) ON DELETE CASCADE
);

-- Index for looking up all collections a product belongs to (product detail page)
CREATE INDEX IF NOT EXISTS idx_product_collections_product_id
  ON product_collections(product_id);

-- Index for looking up all products in a collection (collection page, storefront)
CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id
  ON product_collections(collection_id);

-- Unique composite index to prevent duplicate entries and speed up existence checks
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_collections_unique
  ON product_collections(product_id, collection_id);
