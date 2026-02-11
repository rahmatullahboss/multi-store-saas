-- ============================================================================
-- WISHLISTS TABLE MIGRATION
-- ============================================================================
-- Customer wishlists and wishlist items tables

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wishlist_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  variant_id INTEGER,
  added_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  notes TEXT,
  FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS wishlists_store_id_idx ON wishlists(store_id);
CREATE INDEX IF NOT EXISTS wishlists_customer_id_idx ON wishlists(customer_id);
CREATE INDEX IF NOT EXISTS wishlists_store_customer_idx ON wishlists(store_id, customer_id);

CREATE INDEX IF NOT EXISTS wishlist_items_wishlist_id_idx ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS wishlist_items_product_id_idx ON wishlist_items(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS wishlist_items_unique_item ON wishlist_items(wishlist_id, product_id, variant_id);

-- ============================================================================
-- MIGRATION APPLIED: WISHLISTS TABLES CREATED
-- ============================================================================
