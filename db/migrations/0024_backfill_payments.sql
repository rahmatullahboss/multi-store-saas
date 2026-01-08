-- Backfill payments table from existing stores data
INSERT INTO payments (
  store_id, 
  amount, 
  status, 
  method, 
  transaction_id, 
  plan_type, 
  created_at, 
  period_start, 
  period_end,
  currency
)
SELECT 
  id, 
  CAST(COALESCE(payment_amount, 0) AS INTEGER), 
  'paid', 
  COALESCE(subscription_payment_method, 'manual'), 
  payment_transaction_id, 
  plan_type, 
  COALESCE(payment_submitted_at, created_at), -- Fallback to created_at
  subscription_start_date, 
  subscription_end_date,
  'BDT'
FROM stores 
WHERE payment_status = 'verified';
