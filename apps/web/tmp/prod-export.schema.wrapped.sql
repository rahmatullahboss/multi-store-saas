PRAGMA foreign_keys=OFF;
PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  plan_type TEXT DEFAULT 'free',
  logo TEXT,
  theme TEXT DEFAULT 'default',
  currency TEXT DEFAULT 'USD',
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
, mode TEXT DEFAULT 'store', featured_product_id INTEGER REFERENCES products(id), landing_config TEXT, theme_config TEXT, `default_language` text DEFAULT 'en', `notification_email` text, `email_notifications_enabled` integer DEFAULT true, `low_stock_threshold` integer DEFAULT 10, `favicon` text, `social_links` text, `font_family` text DEFAULT 'inter', `footer_config` text, `custom_domain_request` text, `custom_domain_status` text DEFAULT 'none', `custom_domain_requested_at` integer, `subscription_status` text DEFAULT 'active', `usage_limits` text, business_info TEXT, `cloudflare_hostname_id` text, `ssl_status` text DEFAULT 'pending', `dns_verified` integer DEFAULT false, onboarding_status TEXT DEFAULT 'pending_plan', setup_step INTEGER DEFAULT 0, `custom_privacy_policy` text, `custom_terms_of_service` text, `custom_refund_policy` text, courier_settings text, payment_transaction_id TEXT, payment_status TEXT DEFAULT 'none', payment_submitted_at INTEGER, payment_amount REAL, payment_phone TEXT, is_customer_ai_enabled INTEGER DEFAULT 0, ai_bot_persona TEXT, `subscription_payment_method` text, `subscription_start_date` integer, `subscription_end_date` integer, `admin_note` text, `shipping_config` text, `facebook_pixel_id` text, `deleted_at` integer, `google_analytics_id` text, `facebook_access_token` text, monthly_visitor_count INTEGER DEFAULT 0, visitor_count_reset_at INTEGER, manual_payment_config TEXT, ai_agent_request_status TEXT DEFAULT 'none', ai_agent_requested_at INTEGER, landing_config_draft TEXT, ai_credits INTEGER DEFAULT 50, custom_google_client_id TEXT, custom_google_client_secret TEXT, homepage_builder_page_id TEXT, store_enabled INTEGER DEFAULT 1, home_entry TEXT DEFAULT 'store_home', tagline TEXT, description TEXT, banner_url TEXT, marketing_config TEXT, loyalty_config TEXT);
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  compare_at_price REAL,
  inventory INTEGER DEFAULT 0,
  sku TEXT,
  image_url TEXT,
  images TEXT,
  category TEXT,
  tags TEXT,
  is_published INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
, seo_title TEXT, seo_description TEXT, seo_keywords TEXT, bundle_pricing TEXT);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id),
  order_number TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  shipping_address TEXT,
  billing_address TEXT,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  subtotal REAL NOT NULL,
  tax REAL DEFAULT 0,
  shipping REAL DEFAULT 0,
  total REAL NOT NULL,
  notes TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
, customer_phone TEXT, courier_provider text, courier_consignment_id text, courier_status text, payment_method TEXT DEFAULT 'cod', transaction_id TEXT, manual_payment_details TEXT, review_request_sent integer DEFAULT 0, review_request_sent_at integer, idempotency_key TEXT, `landing_page_id` integer REFERENCES saved_landing_configs(id), `utm_source` text, `utm_medium` text, `utm_campaign` text, pricing_json TEXT);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  title TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  total REAL NOT NULL
, variant_id INTEGER, variant_title TEXT);
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'merchant',
  created_at INTEGER DEFAULT (unixepoch())
, phone TEXT);
CREATE TABLE shipping_zones (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, name text NOT NULL, regions text, rate real DEFAULT 0 NOT NULL, free_above real, estimated_days text, is_active integer DEFAULT true, created_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade);
CREATE TABLE discounts (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, code text NOT NULL, type text DEFAULT 'percentage', value real NOT NULL, min_order_amount real, max_discount_amount real, max_uses integer, used_count integer DEFAULT 0, per_customer_limit integer DEFAULT 1, starts_at integer, expires_at integer, is_active integer DEFAULT true, created_at integer, updated_at integer, `is_flash_sale` integer DEFAULT false, `flash_sale_end_time` integer, `show_on_homepage` integer DEFAULT false, `flash_sale_title` text, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade);
CREATE TABLE shipments (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, order_id integer NOT NULL, courier text, tracking_number text, status text DEFAULT 'pending', courier_data text, shipped_at integer, delivered_at integer, created_at integer, updated_at integer, FOREIGN KEY (order_id) REFERENCES orders(id) ON UPDATE no action ON DELETE cascade);
CREATE TABLE staff_invites (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, email text NOT NULL, role text DEFAULT 'staff', token text NOT NULL UNIQUE, invited_by integer, expires_at integer, accepted_at integer, created_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade, FOREIGN KEY (invited_by) REFERENCES users(id) ON UPDATE no action ON DELETE no action);
CREATE TABLE activity_logs (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, user_id integer, action text NOT NULL, entity_type text, entity_id integer, details text, ip_address text, created_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade, FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action);
CREATE TABLE payouts (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, period_start integer NOT NULL, period_end integer NOT NULL, gross_amount real NOT NULL, platform_fee real DEFAULT 0, net_amount real NOT NULL, status text DEFAULT 'pending', paid_at integer, payment_method text, payment_reference text, notes text, created_at integer, updated_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade);
CREATE TABLE `abandoned_carts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`session_id` text NOT NULL,
	`customer_email` text,
	`customer_phone` text,
	`customer_name` text,
	`cart_items` text NOT NULL,
	`total_amount` real NOT NULL,
	`currency` text DEFAULT 'BDT',
	`abandoned_at` integer,
	`recovered_at` integer,
	`recovery_email_sent` integer DEFAULT false,
	`recovery_email_sent_at` integer,
	`status` text DEFAULT 'abandoned',
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `email_campaigns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`subject` text NOT NULL,
	`preview_text` text,
	`content` text NOT NULL,
	`status` text DEFAULT 'draft',
	`scheduled_at` integer,
	`sent_at` integer,
	`recipient_count` integer DEFAULT 0,
	`sent_count` integer DEFAULT 0,
	`open_count` integer DEFAULT 0,
	`click_count` integer DEFAULT 0,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `email_subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`status` text DEFAULT 'subscribed',
	`source` text,
	`tags` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option1_name TEXT,
  option1_value TEXT,
  option2_name TEXT,
  option2_value TEXT,
  option3_name TEXT,
  option3_value TEXT,
  price REAL,
  compare_at_price REAL,
  sku TEXT,
  inventory INTEGER DEFAULT 0,
  image_url TEXT,
  is_available INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch())
, available INTEGER DEFAULT 0, reserved INTEGER DEFAULT 0);
CREATE TABLE `saved_landing_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`product_id` integer,
	`name` text NOT NULL,
	`landing_config` text NOT NULL,
	`offer_slug` text,
	`is_homepage_backup` integer DEFAULT false,
	`created_at` integer, `is_active` integer DEFAULT true, `view_count` integer DEFAULT 0, `orders` integer DEFAULT 0, `revenue` real DEFAULT 0,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  status TEXT DEFAULT 'pending',
  created_at INTEGER
);
CREATE TABLE system_notifications (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, message text NOT NULL, type text DEFAULT 'info', is_active integer DEFAULT true, created_by integer, created_at integer, FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE no action ON DELETE no action);
CREATE TABLE saas_coupons (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, code TEXT NOT NULL UNIQUE, discount_type TEXT NOT NULL, discount_amount REAL NOT NULL, max_uses INTEGER, used_count INTEGER DEFAULT 0, expires_at INTEGER, is_active INTEGER DEFAULT 1, created_at INTEGER);
CREATE TABLE `ab_test_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`test_id` integer NOT NULL,
	`variant_id` integer NOT NULL,
	`visitor_id` text NOT NULL,
	`assigned_at` integer,
	`converted_at` integer,
	`order_amount` real,
	FOREIGN KEY (`test_id`) REFERENCES `ab_tests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `ab_test_variants`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `ab_test_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`test_id` integer NOT NULL,
	`name` text NOT NULL,
	`landing_config` text,
	`traffic_weight` integer DEFAULT 50,
	`visitors` integer DEFAULT 0,
	`conversions` integer DEFAULT 0,
	`revenue` real DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`test_id`) REFERENCES `ab_tests`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `email_automation_steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`automation_id` integer NOT NULL,
	`delay_minutes` integer DEFAULT 0,
	`subject` text NOT NULL,
	`preview_text` text,
	`content` text NOT NULL,
	`step_order` integer DEFAULT 0,
	`sent_count` integer DEFAULT 0,
	`open_count` integer DEFAULT 0,
	`click_count` integer DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`automation_id`) REFERENCES `email_automations`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `email_automations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`trigger` text NOT NULL,
	`is_active` integer DEFAULT true,
	`total_sent` integer DEFAULT 0,
	`total_opened` integer DEFAULT 0,
	`total_clicked` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `email_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`step_id` integer,
	`recipient_email` text NOT NULL,
	`recipient_name` text,
	`subject` text NOT NULL,
	`content` text NOT NULL,
	`scheduled_at` integer NOT NULL,
	`sent_at` integer,
	`status` text DEFAULT 'pending',
	`error_message` text,
	`metadata` text,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`step_id`) REFERENCES `email_automation_steps`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `order_bumps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`bump_product_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`discount` real DEFAULT 0,
	`is_active` integer DEFAULT true,
	`display_order` integer DEFAULT 0,
	`views` integer DEFAULT 0,
	`conversions` integer DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`bump_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `upsell_offers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`offer_product_id` integer NOT NULL,
	`type` text DEFAULT 'upsell',
	`headline` text NOT NULL,
	`subheadline` text,
	`description` text,
	`discount` real DEFAULT 0,
	`display_order` integer DEFAULT 0,
	`next_offer_id` integer,
	`is_active` integer DEFAULT true,
	`views` integer DEFAULT 0,
	`conversions` integer DEFAULT 0,
	`revenue` real DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`offer_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `upsell_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`token` text NOT NULL,
	`offer_id` integer,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`offer_id`) REFERENCES `upsell_offers`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE admin_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  permissions TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE store_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  note TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE `marketing_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`source` text DEFAULT 'homepage',
	`ip_address` text,
	`user_agent` text,
	`created_at` integer
);
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'BDT',
	`status` text DEFAULT 'pending',
	`method` text DEFAULT 'manual',
	`transaction_id` text,
	`plan_type` text,
	`period_start` integer,
	`period_end` integer,
	`admin_note` text,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`key_prefix` text NOT NULL,
	`key_hash` text NOT NULL,
	`scopes` text DEFAULT '["read_orders","write_orders"]',
	`last_used_at` integer,
	`created_at` integer,
	`revoked_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `system_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` text NOT NULL,
	`message` text NOT NULL,
	`stack` text,
	`context` text,
	`created_at` integer
);
CREATE TABLE `webhooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`url` text NOT NULL,
	`topics` text NOT NULL,
	`secret` text NOT NULL,
	`is_active` integer DEFAULT true,
	`failure_count` integer DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE landing_pages (id INTEGER PRIMARY KEY AUTOINCREMENT, store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE, name TEXT NOT NULL, slug TEXT NOT NULL, project_data TEXT, html_content TEXT, css_content TEXT, is_published INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER, page_config TEXT);
CREATE TABLE `agents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`agent_settings` text,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer, `system_prompt` text, `tone` text DEFAULT 'friendly', `language` text DEFAULT 'bn', `objectives` text, `knowledge_base_id` text, `enabled_channels` text, `whatsapp_phone_id` text, `messenger_page_id` text, type TEXT DEFAULT 'ecommerce', platform_config TEXT,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` integer NOT NULL,
	`customer_phone` text,
	`customer_fb_id` text,
	`session_id` text,
	`customer_name` text,
	`status` text DEFAULT 'active',
	`last_message_at` integer,
	`created_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `faqs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` integer NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `knowledge_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`content` text,
	`status` text DEFAULT 'pending',
	`vector_id` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `visitor_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visitor_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `visitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`created_at` integer
);
CREATE TABLE `password_resets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `store_themes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`template_id` text,
	`marketplace_theme_id` integer,
	`name` text NOT NULL,
	`config` text NOT NULL,
	`thumbnail` text,
	`is_active` integer DEFAULT false,
	`installed_at` integer,
	`last_used_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`marketplace_theme_id`) REFERENCES `marketplace_themes`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `ai_conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` integer NOT NULL,
	`store_id` integer NOT NULL,
	`customer_id` integer,
	`visitor_id` text,
	`customer_phone` text,
	`customer_name` text,
	`channel` text DEFAULT 'web',
	`external_id` text,
	`status` text DEFAULT 'active',
	`last_message_at` integer,
	`created_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE set null
);
CREATE TABLE loyalty_transactions (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  store_id integer NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id integer NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  points integer NOT NULL,
  type text NOT NULL,
  description text,
  created_at integer
);
CREATE TABLE `push_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`user_id` integer,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`user_agent` text,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`actor_id` integer NOT NULL,
	`action` text NOT NULL,
	`resource` text NOT NULL,
	`resource_id` text,
	`diff` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `credit_usage_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`metadata` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `marketplace_themes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`thumbnail` text,
	`config` text NOT NULL,
	`created_by` integer,
	`author_name` text,
	`is_public` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE webhook_delivery_logs (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, webhook_id integer NOT NULL, event_type text NOT NULL, payload text NOT NULL, status_code integer, response_body text, success integer DEFAULT false, error_message text, attempt_count integer DEFAULT 1, delivered_at integer, FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE);
CREATE TABLE cache_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE ai_cache (
  key TEXT PRIMARY KEY,
  response TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE `collections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`image_url` text,
	`is_active` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `product_collections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`collection_id` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,  -- 'stripe' | 'bkash' | 'steadfast' | 'pathao' | 'redx'
  event_id TEXT NOT NULL,  -- Provider's unique event ID
  event_type TEXT,         -- e.g., 'payment_intent.succeeded'
  payload_json TEXT,       -- Full webhook payload for debugging
  status TEXT DEFAULT 'processed',  -- 'processed' | 'failed' | 'skipped'
  processed_at INTEGER,    -- When we processed this event (timestamp)
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE builder_pages (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  slug TEXT NOT NULL,
  title TEXT,
  product_id INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at INTEGER,
  template_id TEXT,
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  view_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()), last_published_at INTEGER, whatsapp_enabled INTEGER DEFAULT 1, whatsapp_number TEXT, whatsapp_message TEXT, call_enabled INTEGER DEFAULT 1, call_number TEXT, custom_header_html TEXT, custom_footer_html TEXT, canonical_url TEXT, no_index INTEGER DEFAULT 0, order_enabled INTEGER DEFAULT 1, order_text TEXT DEFAULT 'অর্ডার করুন', order_bg_color TEXT DEFAULT '#6366F1', order_text_color TEXT DEFAULT '#FFFFFF', button_position TEXT DEFAULT 'bottom-right', intent_json TEXT, style_tokens_json TEXT,
  FOREIGN KEY(store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id),
  UNIQUE(store_id, slug)
);
CREATE TABLE builder_sections (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL,
  props_json TEXT NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()), published_props_json TEXT, published_at INTEGER, variant TEXT,
  FOREIGN KEY(page_id) REFERENCES builder_pages(id) ON DELETE CASCADE
);
CREATE TABLE advanced_builder_pages (id text PRIMARY KEY NOT NULL, store_id integer NOT NULL, slug text NOT NULL, title text, product_id integer, status text DEFAULT 'draft', published_at integer, last_published_at integer, template_id text, seo_title text, seo_description text, og_image text, view_count integer DEFAULT 0, order_count integer DEFAULT 0, created_at integer, updated_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE cascade, FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE NO ACTION);
CREATE TABLE advanced_builder_sections (id text PRIMARY KEY NOT NULL, page_id text NOT NULL, type text NOT NULL, enabled integer DEFAULT 1 NOT NULL, sort_order integer NOT NULL, props_json text DEFAULT '{}' NOT NULL, blocks_json text DEFAULT '[]' NOT NULL, published_props_json text, published_blocks_json text, published_at integer, version integer DEFAULT 1 NOT NULL, created_at integer, updated_at integer, FOREIGN KEY (page_id) REFERENCES advanced_builder_pages(id) ON DELETE cascade);
CREATE TABLE IF NOT EXISTS "leads_data" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `product_recommendations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`source_product_id` integer NOT NULL,
	`recommended_product_id` integer NOT NULL,
	`score` real DEFAULT 0,
	`reason` text DEFAULT 'similar_category',
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recommended_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE IF NOT EXISTS "ab_tests" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`test_key` text NOT NULL,
	`variant_a` text NOT NULL,
	`variant_b` text NOT NULL,
	`traffic_split` integer DEFAULT 50,
	`status` text DEFAULT 'active',
	`views_a` integer DEFAULT 0,
	`conversions_a` integer DEFAULT 0,
	`views_b` integer DEFAULT 0,
	`conversions_b` integer DEFAULT 0,
	`winner` text,
	`started_at` integer,
	`ended_at` integer,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `published_pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`page_type` text DEFAULT 'landing',
	`product_id` integer,
	`html_content` text NOT NULL,
	`css_content` text,
	`meta_tags` text,
	`template_id` text,
	`config_hash` text,
	`published_at` integer,
	`expires_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `page_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`config_json` text NOT NULL,
	`version_label` text,
	`created_by` integer,
	`published_at` integer,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `template_analytics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`template_id` text NOT NULL,
	`page_views` integer DEFAULT 0,
	`unique_visitors` integer DEFAULT 0,
	`orders_generated` integer DEFAULT 0,
	`revenue_generated` real DEFAULT 0,
	`conversion_rate` real DEFAULT 0,
	`period_start` integer,
	`period_end` integer,
	`updated_at` integer,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE IF NOT EXISTS "customers" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    phone TEXT,
    address TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    risk_score INTEGER,
    risk_checked_at INTEGER,
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    last_order_at INTEGER,
    segment TEXT DEFAULT 'new',
    tags TEXT,
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'bronze',
    referred_by INTEGER
, password_hash TEXT, google_id TEXT, auth_provider TEXT DEFAULT 'email', last_login_at INTEGER);
CREATE TABLE checkout_sessions (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- Cart snapshot
  cart_json TEXT NOT NULL,
  
  -- Customer info
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  customer_name TEXT,
  
  -- Addresses
  shipping_address_json TEXT,
  billing_address_json TEXT,
  
  -- Server-calculated pricing
  pricing_json TEXT,
  discount_code TEXT,
  
  -- Payment method
  payment_method TEXT DEFAULT 'cod' CHECK(payment_method IN ('cod', 'bkash', 'nagad', 'stripe')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'abandoned', 'expired')),
  
  -- Idempotency
  idempotency_key TEXT UNIQUE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Expiration
  expires_at INTEGER,
  
  -- Attribution
  landing_page_id INTEGER,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE TABLE carts (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- Customer/Visitor identification
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  visitor_id TEXT, -- Anonymous visitor tracking
  session_id TEXT, -- Server session ID
  
  -- Currency
  currency TEXT DEFAULT 'BDT',
  
  -- Status and expiration
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'converted', 'abandoned', 'merged')),
  expires_at INTEGER,
  
  -- Timestamps
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE TABLE cart_items (
  id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- Product reference
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Quantity
  quantity INTEGER NOT NULL DEFAULT 1,
  
  -- Price snapshot at add time
  unit_price_snapshot REAL,
  title_snapshot TEXT,
  image_snapshot TEXT,
  variant_title_snapshot TEXT,
  
  -- Timestamps
  added_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE TABLE shop_domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_primary INTEGER DEFAULT 0, -- 1 = primary domain for the store
  ssl_status TEXT DEFAULT 'pending', -- pending, provisioning, active, failed
  verified_at INTEGER, -- Timestamp when domain was verified
  dns_verified INTEGER DEFAULT 0, -- 1 = DNS verification passed
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT, -- Short code like "DHK-1", "CTG-2"
  address TEXT,
  city TEXT,
  district TEXT,
  phone TEXT,
  is_default INTEGER DEFAULT 0, -- 1 = default location for new inventory
  is_active INTEGER DEFAULT 1,
  fulfillment_priority INTEGER DEFAULT 0, -- Higher = prefer for order fulfillment
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
CREATE TABLE location_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0, -- Reserved for pending orders
  reorder_point INTEGER DEFAULT 0, -- Alert when quantity falls below
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  UNIQUE(location_id, product_id, variant_id)
);
CREATE TABLE `themes` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`name` text DEFAULT 'Default Theme' NOT NULL,
	`preset_id` text,
	`is_active` integer DEFAULT 1,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `theme_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`theme_id` text NOT NULL,
	`template_key` text NOT NULL,
	`title` text,
	`description` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `template_sections_draft` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`template_id` text NOT NULL,
	`type` text NOT NULL,
	`enabled` integer DEFAULT 1,
	`sort_order` integer NOT NULL,
	`props_json` text DEFAULT '{}',
	`blocks_json` text DEFAULT '[]',
	`version` integer DEFAULT 1,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`template_id`) REFERENCES `theme_templates`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `template_sections_published` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`template_id` text NOT NULL,
	`type` text NOT NULL,
	`enabled` integer DEFAULT 1,
	`sort_order` integer NOT NULL,
	`props_json` text DEFAULT '{}',
	`blocks_json` text DEFAULT '[]',
	`published_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`template_id`) REFERENCES `theme_templates`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `theme_settings_draft` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`theme_id` text NOT NULL,
	`settings_json` text DEFAULT '{}',
	`version` integer DEFAULT 1,
	`updated_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `theme_settings_published` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`theme_id` text NOT NULL,
	`settings_json` text DEFAULT '{}',
	`published_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `theme_presets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`thumbnail_url` text,
	`category` text,
	`default_settings_json` text DEFAULT '{}',
	`default_templates_json` text DEFAULT '{}',
	`is_active` integer DEFAULT 1,
	`created_at` integer
);
CREATE TABLE saved_blocks (
    id TEXT PRIMARY KEY,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Block metadata
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'custom',
    description TEXT,
    
    -- Block content (GrapesJS JSON format)
    content TEXT NOT NULL,
    
    -- Preview thumbnail (optional)
    thumbnail TEXT,
    
    -- Usage tracking
    usage_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps (stored as Unix milliseconds)
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);
CREATE TABLE page_revisions (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL REFERENCES builder_pages(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Revision content (full GrapesJS project data)
    content TEXT NOT NULL,
    
    -- Revision metadata
    revision_type TEXT NOT NULL DEFAULT 'auto', -- 'auto', 'manual', 'publish'
    description TEXT, -- User-provided description for manual saves
    
    -- Who created this revision
    created_by INTEGER REFERENCES store_users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);
CREATE TABLE metafield_definitions (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  owner_type TEXT NOT NULL,
  validations TEXT,
  pinned INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, namespace, key, owner_type)
);
CREATE TABLE metafields (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  definition_id TEXT,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  owner_type TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, namespace, key, owner_id, owner_type),
  FOREIGN KEY (definition_id) REFERENCES metafield_definitions(id) ON DELETE SET NULL
);
CREATE TABLE template_versions (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  template_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  label TEXT,
  sections_json TEXT NOT NULL,
  settings_json TEXT,
  published_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE store_mvp_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  theme_id TEXT DEFAULT 'starter-store' NOT NULL,
  settings_json TEXT NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Function calls (if AI called a tool)
  function_name TEXT,
  function_args TEXT,
  function_result TEXT,
  
  -- Metadata
  tokens_used INTEGER,
  credits_used INTEGER DEFAULT 1,
  
  created_at INTEGER
);
DELETE FROM sqlite_sequence;
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_store_category ON products(store_id, category);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_status ON orders(store_id, status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_stores_mode ON stores(mode);
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_store_id_idx ON users(store_id);
CREATE INDEX `abandoned_carts_store_id_idx` ON `abandoned_carts` (`store_id`);
CREATE INDEX `abandoned_carts_session_idx` ON `abandoned_carts` (`session_id`);
CREATE INDEX `abandoned_carts_status_idx` ON `abandoned_carts` (`store_id`, `status`);
CREATE INDEX `email_campaigns_store_id_idx` ON `email_campaigns` (`store_id`);
CREATE INDEX `email_campaigns_status_idx` ON `email_campaigns` (`store_id`,`status`);
CREATE INDEX `email_subscribers_store_id_idx` ON `email_subscribers` (`store_id`);
CREATE INDEX `email_subscribers_email_idx` ON `email_subscribers` (`store_id`,`email`);
CREATE INDEX `saved_landing_configs_store_id_idx` ON `saved_landing_configs` (`store_id`);
CREATE INDEX reviews_store_product_idx ON reviews(store_id, product_id);
CREATE INDEX reviews_status_idx ON reviews(store_id, status);
CREATE INDEX saas_coupons_code_idx ON saas_coupons (code);
CREATE UNIQUE INDEX `saas_coupons_code_unique` ON `saas_coupons` (`code`);
CREATE INDEX `ab_test_assignments_visitor_idx` ON `ab_test_assignments` (`test_id`,`visitor_id`);
CREATE INDEX `ab_test_variants_test_idx` ON `ab_test_variants` (`test_id`);
CREATE INDEX `email_automation_steps_automation_idx` ON `email_automation_steps` (`automation_id`);
CREATE INDEX `email_automations_store_idx` ON `email_automations` (`store_id`);
CREATE INDEX `email_queue_scheduled_idx` ON `email_queue` (`scheduled_at`,`status`);
CREATE INDEX `email_queue_store_idx` ON `email_queue` (`store_id`);
CREATE INDEX `order_bumps_store_product_idx` ON `order_bumps` (`store_id`,`product_id`);
CREATE INDEX `upsell_offers_store_product_idx` ON `upsell_offers` (`store_id`,`product_id`);
CREATE UNIQUE INDEX `upsell_tokens_token_unique` ON `upsell_tokens` (`token`);
CREATE INDEX `upsell_tokens_token_idx` ON `upsell_tokens` (`token`);
CREATE INDEX page_views_store_idx ON page_views(store_id);
CREATE INDEX page_views_date_idx ON page_views(store_id, created_at);
CREATE INDEX page_views_visitor_idx ON page_views(store_id, visitor_id);
CREATE INDEX admin_roles_user_idx ON admin_roles(user_id);
CREATE INDEX store_tags_store_idx ON store_tags(store_id);
CREATE INDEX store_tags_tag_idx ON store_tags(tag);
CREATE UNIQUE INDEX `marketing_leads_email_unique` ON `marketing_leads` (`email`);
CREATE INDEX `marketing_leads_email_idx` ON `marketing_leads` (`email`);
CREATE INDEX landing_pages_store_id_idx ON landing_pages(store_id);
CREATE INDEX landing_pages_slug_idx ON landing_pages(store_id, slug);
CREATE INDEX `agents_store_id_idx` ON `agents` (`store_id`);
CREATE INDEX `conversations_agent_id_idx` ON `conversations` (`agent_id`);
CREATE INDEX `conversations_phone_idx` ON `conversations` (`customer_phone`);
CREATE INDEX `conversations_session_idx` ON `conversations` (`session_id`);
CREATE INDEX `faqs_agent_id_idx` ON `faqs` (`agent_id`);
CREATE INDEX `knowledge_sources_agent_id_idx` ON `knowledge_sources` (`agent_id`);
CREATE INDEX `visitor_messages_visitor_id_idx` ON `visitor_messages` (`visitor_id`);
CREATE UNIQUE INDEX `password_resets_token_unique` ON `password_resets` (`token`);
CREATE INDEX `password_resets_token_idx` ON `password_resets` (`token`);
CREATE INDEX `password_resets_user_idx` ON `password_resets` (`user_id`);
CREATE INDEX `store_themes_store_id_idx` ON `store_themes` (`store_id`);
CREATE INDEX `store_themes_active_idx` ON `store_themes` (`store_id`,`is_active`);
CREATE INDEX `ai_conversations_agent_idx` ON `ai_conversations` (`agent_id`);
CREATE INDEX `ai_conversations_store_idx` ON `ai_conversations` (`store_id`);
CREATE INDEX loyalty_tx_customer_idx ON loyalty_transactions(customer_id);
CREATE INDEX loyalty_tx_store_idx ON loyalty_transactions(store_id);
CREATE UNIQUE INDEX `push_subscriptions_endpoint_unique` ON `push_subscriptions` (`endpoint`);
CREATE INDEX `push_subscriptions_store_id_idx` ON `push_subscriptions` (`store_id`);
CREATE INDEX `push_subscriptions_user_id_idx` ON `push_subscriptions` (`user_id`);
CREATE INDEX `admin_audit_logs_store_idx` ON `admin_audit_logs` (`store_id`);
CREATE INDEX `admin_audit_logs_actor_idx` ON `admin_audit_logs` (`actor_id`);
CREATE INDEX `admin_audit_logs_action_idx` ON `admin_audit_logs` (`store_id`,`action`);
CREATE INDEX webhook_logs_webhook_idx ON webhook_delivery_logs (webhook_id);
CREATE INDEX webhook_logs_event_idx ON webhook_delivery_logs (event_type);
CREATE INDEX idx_cache_expires ON cache_store(expires_at);
CREATE INDEX idx_ai_cache_expires ON ai_cache(expires_at);
CREATE INDEX `collections_store_id_idx` ON `collections` (`store_id`);
CREATE INDEX `collections_slug_idx` ON `collections` (`store_id`,`slug`);
CREATE INDEX `saved_landing_configs_slug_idx` ON `saved_landing_configs` (`store_id`,`offer_slug`);
CREATE UNIQUE INDEX idx_webhook_events_unique 
ON webhook_events(provider, event_id);
CREATE INDEX idx_webhook_events_store 
ON webhook_events(store_id, created_at);
CREATE UNIQUE INDEX idx_orders_idempotency 
ON orders(store_id, idempotency_key);
CREATE INDEX idx_builder_pages_store
ON builder_pages(store_id);
CREATE INDEX idx_builder_sections_order
ON builder_sections(page_id, sort_order);
CREATE INDEX idx_product_variants_inventory 
ON product_variants(product_id, available);
CREATE INDEX idx_adv_builder_pages_store ON advanced_builder_pages (store_id);
CREATE UNIQUE INDEX uniq_adv_builder_pages_slug ON advanced_builder_pages (store_id, slug);
CREATE INDEX idx_adv_builder_sections_page_order ON advanced_builder_sections (page_id, sort_order);
CREATE INDEX `ai_conversations_customer_idx` ON `ai_conversations` (`customer_id`);
CREATE INDEX `leads_data_conversation_idx` ON `leads_data` (`conversation_id`);
CREATE INDEX `prod_recs_source_idx` ON `product_recommendations` (`store_id`,`source_product_id`);
CREATE INDEX `ab_tests_store_key_idx` ON `ab_tests` (`store_id`,`test_key`);
CREATE INDEX `ab_tests_status_idx` ON `ab_tests` (`store_id`,`status`);
CREATE INDEX `published_pages_store_id_idx` ON `published_pages` (`store_id`);
CREATE INDEX `published_pages_config_hash_idx` ON `published_pages` (`store_id`,`config_hash`);
CREATE INDEX `page_versions_store_id_idx` ON `page_versions` (`store_id`);
CREATE INDEX `template_analytics_store_id_idx` ON `template_analytics` (`store_id`);
CREATE INDEX `template_analytics_template_idx` ON `template_analytics` (`store_id`,`template_id`);
CREATE INDEX customers_store_id_idx ON customers(store_id);
CREATE INDEX customers_segment_idx ON customers(store_id, segment);
CREATE INDEX customers_google_id_idx ON customers(store_id, google_id);
CREATE INDEX idx_checkout_sessions_store ON checkout_sessions(store_id);
CREATE INDEX idx_checkout_sessions_status ON checkout_sessions(store_id, status);
CREATE INDEX idx_checkout_sessions_expires ON checkout_sessions(expires_at);
CREATE INDEX idx_carts_store ON carts(store_id);
CREATE INDEX idx_carts_customer ON carts(customer_id);
CREATE INDEX idx_carts_visitor ON carts(visitor_id);
CREATE INDEX idx_carts_status ON carts(store_id, status);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
CREATE INDEX idx_shop_domains_store ON shop_domains(store_id);
CREATE INDEX idx_shop_domains_domain ON shop_domains(domain);
CREATE INDEX idx_locations_store ON locations(store_id);
CREATE INDEX idx_locations_active ON locations(store_id, is_active);
CREATE INDEX idx_location_inventory_location ON location_inventory(location_id);
CREATE INDEX idx_location_inventory_product ON location_inventory(product_id);
CREATE INDEX idx_location_inventory_variant ON location_inventory(variant_id);
CREATE INDEX `idx_themes_shop` ON `themes` (`shop_id`);
CREATE INDEX `idx_themes_active` ON `themes` (`shop_id`, `is_active`);
CREATE INDEX `idx_theme_templates_theme` ON `theme_templates` (`theme_id`);
CREATE INDEX `idx_theme_templates_shop` ON `theme_templates` (`shop_id`);
CREATE UNIQUE INDEX `uniq_theme_template_key` ON `theme_templates` (`theme_id`, `template_key`);
CREATE INDEX idx_saved_blocks_store ON saved_blocks(store_id);
CREATE INDEX idx_saved_blocks_category ON saved_blocks(store_id, category);
CREATE INDEX idx_saved_blocks_created ON saved_blocks(store_id, created_at DESC);
CREATE INDEX idx_page_revisions_page ON page_revisions(page_id);
CREATE INDEX idx_page_revisions_store ON page_revisions(store_id);
CREATE INDEX idx_page_revisions_created ON page_revisions(page_id, created_at DESC);
CREATE INDEX idx_builder_sections_variant ON builder_sections(page_id, variant);
CREATE INDEX idx_metafield_definitions_store 
  ON metafield_definitions(store_id);
CREATE INDEX idx_metafield_definitions_owner_type 
  ON metafield_definitions(store_id, owner_type);
CREATE INDEX idx_metafields_store 
  ON metafields(store_id);
CREATE INDEX idx_metafields_owner 
  ON metafields(store_id, owner_type, owner_id);
CREATE INDEX idx_metafields_namespace 
  ON metafields(store_id, namespace, key);
CREATE INDEX idx_template_versions_store 
  ON template_versions(store_id);
CREATE INDEX idx_template_versions_template 
  ON template_versions(template_id);
CREATE INDEX idx_template_versions_theme 
  ON template_versions(theme_id, template_id, version DESC);
CREATE UNIQUE INDEX `checkout_sessions_idempotency_key_unique` ON `checkout_sessions` (`idempotency_key`);
CREATE UNIQUE INDEX `shop_domains_domain_unique` ON `shop_domains` (`domain`);
CREATE INDEX idx_builder_pages_last_published ON builder_pages(store_id, last_published_at);
CREATE INDEX idx_stores_deleted_at ON stores(deleted_at);
CREATE INDEX idx_stores_subdomain_deleted ON stores(subdomain, deleted_at);
CREATE INDEX idx_stores_custom_domain_deleted ON stores(custom_domain, deleted_at);
CREATE INDEX idx_stores_active_deleted ON stores(is_active, deleted_at);
CREATE INDEX idx_mvp_settings_store ON store_mvp_settings (store_id);
CREATE INDEX idx_mvp_settings_theme ON store_mvp_settings (store_id, theme_id);
CREATE INDEX products_store_published_idx ON products(store_id, is_published);
CREATE INDEX orders_store_created_idx ON orders(store_id, created_at);
CREATE INDEX page_views_store_created_idx ON page_views(store_id, created_at);
CREATE INDEX abandoned_carts_store_created_idx ON abandoned_carts(store_id, abandoned_at);
CREATE INDEX product_variants_product_available_idx ON product_variants(product_id, is_available);
CREATE INDEX messages_conversation_idx ON messages(conversation_id);

PRAGMA foreign_keys=ON;
