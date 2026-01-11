ALTER TABLE customers ADD COLUMN loyalty_points integer DEFAULT 0;
ALTER TABLE customers ADD COLUMN loyalty_tier text DEFAULT 'bronze';
ALTER TABLE customers ADD COLUMN referred_by integer;

ALTER TABLE orders ADD COLUMN review_request_sent integer DEFAULT 0;
ALTER TABLE orders ADD COLUMN review_request_sent_at integer;

CREATE TABLE loyalty_transactions (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  store_id integer NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id integer NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  points integer NOT NULL,
  type text NOT NULL,
  description text,
  created_at integer
);
CREATE INDEX loyalty_tx_customer_idx ON loyalty_transactions(customer_id);
CREATE INDEX loyalty_tx_store_idx ON loyalty_transactions(store_id);
