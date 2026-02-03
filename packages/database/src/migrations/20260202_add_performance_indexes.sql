CREATE INDEX IF NOT EXISTS products_store_published_idx ON products(store_id, is_published);
CREATE INDEX IF NOT EXISTS orders_store_created_idx ON orders(store_id, created_at);
CREATE INDEX IF NOT EXISTS page_views_store_created_idx ON page_views(store_id, created_at);
CREATE INDEX IF NOT EXISTS abandoned_carts_store_created_idx ON abandoned_carts(store_id, created_at);
CREATE INDEX IF NOT EXISTS product_variants_product_available_idx ON product_variants(product_id, is_available);
