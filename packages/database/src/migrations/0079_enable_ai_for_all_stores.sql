-- 0079_enable_ai_for_all_stores.sql
--
-- Enable AI Assistant for all stores (remove premium lock)
-- All stores now get 50 free credits via credit system
--
-- Enable AI for stores that have it disabled
UPDATE stores SET is_customer_ai_enabled = 1 WHERE is_customer_ai_enabled = 0;

-- Ensure all stores have at least 50 credits (for stores with NULL or 0)
UPDATE stores SET ai_credits = 50 WHERE ai_credits IS NULL OR ai_credits < 50;

-- Confirm the updates
SELECT
  COUNT(*) as total_stores,
  SUM(CASE WHEN is_customer_ai_enabled = 1 THEN 1 ELSE 0 END) as ai_enabled_stores,
  AVG(ai_credits) as avg_credits,
  MIN(ai_credits) as min_credits
FROM stores;
