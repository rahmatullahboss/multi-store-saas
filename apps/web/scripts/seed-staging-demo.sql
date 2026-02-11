-- Seed a demo store for staging workers.dev hostname resolution.
--
-- Usage:
--   npm --workspace apps/web run db:seed:staging-demo
--
-- Notes:
-- - Safe to re-run: upserts store by subdomain, and re-seeds demo products by SKU prefix.
-- - The custom_domain is set to the current staging workers.dev URL used by the deploy.

WITH now_ms(v) AS (
  SELECT CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)
)
INSERT INTO stores (
  name,
  subdomain,
  custom_domain,
  custom_domain_status,
  onboarding_status,
  setup_step,
  store_enabled,
  home_entry,
  theme_config,
  business_info,
  social_links,
  currency,
  default_language,
  is_active,
  created_at,
  updated_at
) VALUES (
  'Staging Demo Store',
  'staging-demo',
  'multi-store-saas-staging.rahmatullahzisan.workers.dev',
  'approved',
  'completed',
  999,
  1,
  'store_home',
  '{"storeTemplateId":"starter-store"}',
  '{"phone":"+8801XXXXXXXXX","email":"support@example.com","address":"Dhaka, Bangladesh","city":"Dhaka","country":"BD"}',
  '{"facebook":"https://facebook.com/ozzyl","whatsapp":"+8801XXXXXXXXX"}',
  'BDT',
  'bn',
  1,
  (SELECT v FROM now_ms),
  (SELECT v FROM now_ms)
)
ON CONFLICT(subdomain) DO UPDATE SET
  name = excluded.name,
  custom_domain = excluded.custom_domain,
  custom_domain_status = excluded.custom_domain_status,
  onboarding_status = excluded.onboarding_status,
  setup_step = excluded.setup_step,
  store_enabled = excluded.store_enabled,
  home_entry = excluded.home_entry,
  theme_config = excluded.theme_config,
  business_info = excluded.business_info,
  social_links = excluded.social_links,
  currency = excluded.currency,
  default_language = excluded.default_language,
  is_active = excluded.is_active,
  updated_at = (SELECT v FROM now_ms);

-- Re-seed demo products (idempotent via SKU prefix cleanup)
DELETE FROM products
WHERE store_id = (SELECT id FROM stores WHERE subdomain = 'staging-demo')
  AND sku LIKE 'STAGING-DEMO-%';

WITH
  sid(v) AS (SELECT id FROM stores WHERE subdomain = 'staging-demo'),
  now_ms(v) AS (SELECT CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER))
INSERT INTO products (
  store_id,
  title,
  description,
  price,
  compare_at_price,
  inventory,
  sku,
  image_url,
  category,
  tags,
  is_published,
  created_at,
  updated_at
)
SELECT
  (SELECT v FROM sid),
  p.title,
  p.description,
  p.price,
  p.compare_at_price,
  p.inventory,
  p.sku,
  p.image_url,
  p.category,
  p.tags,
  1,
  (SELECT v FROM now_ms),
  (SELECT v FROM now_ms)
FROM (
  SELECT
    'প্রিমিয়াম ওয়্যারলেস হেডফোন' AS title,
    'অসাধারণ সাউন্ড কোয়ালিটি এবং দীর্ঘ ব্যাটারি লাইফ।' AS description,
    1490.0 AS price,
    1990.0 AS compare_at_price,
    25 AS inventory,
    'STAGING-DEMO-001' AS sku,
    'https://placehold.co/800x800/png' AS image_url,
    'Electronics' AS category,
    '["headphone","wireless","demo"]' AS tags
  UNION ALL
  SELECT
    'কটন টি-শার্ট (ইউনিসেক্স)' AS title,
    'সফট কটন, ডেইলি ইউজের জন্য পারফেক্ট।' AS description,
    590.0 AS price,
    790.0 AS compare_at_price,
    50 AS inventory,
    'STAGING-DEMO-002' AS sku,
    'https://placehold.co/800x800/jpg' AS image_url,
    'Fashion' AS category,
    '["tshirt","cotton","demo"]' AS tags
  UNION ALL
  SELECT
    'স্টাইলিশ ব্যাকপ্যাক' AS title,
    'ট্রাভেল/অফিসের জন্য ডিউরেবল ব্যাকপ্যাক।' AS description,
    990.0 AS price,
    1290.0 AS compare_at_price,
    15 AS inventory,
    'STAGING-DEMO-003' AS sku,
    'https://placehold.co/800x800/webp' AS image_url,
    'Accessories' AS category,
    '["bag","backpack","demo"]' AS tags
) AS p
WHERE (SELECT v FROM sid) IS NOT NULL;

