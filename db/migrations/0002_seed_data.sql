-- Seed data for development/testing

-- Insert sample stores
INSERT INTO stores (name, subdomain, custom_domain, plan_type, currency) VALUES
  ('Demo Store', 'demo', NULL, 'pro', 'USD'),
  ('Fashion Hub', 'fashion', NULL, 'starter', 'USD'),
  ('Tech Shop', 'tech', 'techshop.example.com', 'enterprise', 'USD');

-- Insert sample products for Demo Store (store_id = 1)
INSERT INTO products (store_id, title, description, price, compare_at_price, inventory, category, is_published) VALUES
  (1, 'Classic White T-Shirt', 'Premium cotton t-shirt for everyday wear', 29.99, 39.99, 100, 'Clothing', 1),
  (1, 'Wireless Bluetooth Headphones', 'High-quality audio with noise cancellation', 149.99, NULL, 50, 'Electronics', 1),
  (1, 'Leather Wallet', 'Genuine leather bifold wallet', 49.99, 59.99, 75, 'Accessories', 1),
  (1, 'Running Shoes', 'Lightweight and comfortable running shoes', 89.99, 119.99, 30, 'Footwear', 1),
  (1, 'Smartwatch', 'Track your fitness and stay connected', 199.99, NULL, 25, 'Electronics', 1);

-- Insert sample products for Fashion Hub (store_id = 2)
INSERT INTO products (store_id, title, description, price, inventory, category, is_published) VALUES
  (2, 'Summer Dress', 'Light and breezy summer dress', 79.99, 40, 'Dresses', 1),
  (2, 'Denim Jacket', 'Classic denim jacket for all seasons', 99.99, 35, 'Outerwear', 1),
  (2, 'Designer Sunglasses', 'UV protection with style', 159.99, 20, 'Accessories', 1);

-- Insert sample products for Tech Shop (store_id = 3)
INSERT INTO products (store_id, title, description, price, inventory, category, is_published) VALUES
  (3, 'Mechanical Keyboard', 'RGB backlit mechanical keyboard', 129.99, 45, 'Peripherals', 1),
  (3, 'Gaming Mouse', 'High-precision gaming mouse', 79.99, 60, 'Peripherals', 1),
  (3, '4K Monitor', '27-inch 4K UHD monitor', 399.99, 15, 'Displays', 1),
  (3, 'USB-C Hub', 'Multi-port USB-C hub', 59.99, 80, 'Accessories', 1);
