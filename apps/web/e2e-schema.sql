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

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  store_id INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  cart_items TEXT NOT NULL,
  total_amount REAL NOT NULL,
  currency TEXT DEFAULT 'BDT',
  abandoned_at INTEGER,
  recovered_at INTEGER,
  recovery_email_sent INTEGER DEFAULT false,
  recovery_email_sent_at INTEGER,
  status TEXT DEFAULT 'abandoned',
  FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `activity_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`user_id` integer,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` integer,
	`details` text,
	`ip_address` text,
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

CREATE TABLE IF NOT EXISTS admin_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  permissions TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS `agents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`agent_settings` text,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer, `system_prompt` text, `tone` text DEFAULT 'friendly', `language` text DEFAULT 'bn', `objectives` text, `knowledge_base_id` text, `enabled_channels` text, `whatsapp_phone_id` text, `messenger_page_id` text,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS ai_cache (
  key TEXT PRIMARY KEY,
  response TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `ai_conversations` (
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
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE IF NOT EXISTS `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`key_prefix` text NOT NULL,
	`key_hash` text NOT NULL,
	`scopes` text DEFAULT '["read_orders","write_orders"]',
	`last_used_at` integer,
	`created_at` integer,
	`revoked_at` integer, plan_id INTEGER REFERENCES api_plans(id) ON DELETE SET NULL, expires_at INTEGER, plan TEXT DEFAULT 'free', wc_webhook_secret TEXT DEFAULT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS api_plans (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  name               TEXT NOT NULL,                        
  slug               TEXT NOT NULL UNIQUE,                 
  price_paisa        INTEGER NOT NULL DEFAULT 0,           
  
  trial_days         INTEGER NOT NULL DEFAULT 0,
  requests_per_min   INTEGER NOT NULL DEFAULT 30,
  requests_per_day   INTEGER NOT NULL DEFAULT 1000,
  max_webhooks       INTEGER NOT NULL DEFAULT 2,
  allowed_scopes     TEXT NOT NULL DEFAULT '["read_orders","read_products"]', 
  is_active          INTEGER NOT NULL DEFAULT 1,           
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS api_subscriptions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id     INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  plan_id      INTEGER NOT NULL REFERENCES api_plans(id),
  status       TEXT NOT NULL DEFAULT 'active', 
  trial_ends   INTEGER,                         
  current_period_start INTEGER,
  current_period_end   INTEGER,
  cancelled_at INTEGER,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS builder_page_daily_stats (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id          TEXT    NOT NULL,
  store_id         INTEGER NOT NULL,
  date             TEXT    NOT NULL,    
  total_views      INTEGER DEFAULT 0,
  unique_visitors  INTEGER DEFAULT 0,
  mobile_views     INTEGER DEFAULT 0,
  tablet_views     INTEGER DEFAULT 0,
  desktop_views    INTEGER DEFAULT 0,
  avg_scroll_depth REAL    DEFAULT 0,
  cta_clicks       INTEGER DEFAULT 0,
  form_submits     INTEGER DEFAULT 0,
  UNIQUE(page_id, date)
);

CREATE TABLE IF NOT EXISTS builder_page_events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id      TEXT    NOT NULL,
  store_id     INTEGER NOT NULL,
  event_type   TEXT    NOT NULL CHECK(event_type IN (
                 'pageview', 'section_view', 'cta_click', 'form_submit', 'scroll_depth'
               )),
  session_id   TEXT    NOT NULL,        
  visitor_id   TEXT,                    
  section_id   TEXT,                    
  section_type TEXT,                    
  scroll_depth INTEGER,                 
  device_type  TEXT    CHECK(device_type IN ('mobile', 'tablet', 'desktop')),
  referrer     TEXT,
  country      TEXT,                    
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS builder_pages (
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
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()), whatsapp_enabled INTEGER DEFAULT 1, whatsapp_number TEXT, whatsapp_message TEXT, call_enabled INTEGER DEFAULT 1, call_number TEXT, custom_header_html TEXT, custom_footer_html TEXT, canonical_url TEXT, no_index INTEGER DEFAULT 0, last_published_at INTEGER,
  FOREIGN KEY(store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id),
  UNIQUE(store_id, slug)
);

CREATE TABLE IF NOT EXISTS builder_section_stats (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id          TEXT    NOT NULL,
  store_id         INTEGER NOT NULL,
  section_id       TEXT    NOT NULL,
  section_type     TEXT    NOT NULL,
  view_count       INTEGER DEFAULT 0,
  click_count      INTEGER DEFAULT 0,
  avg_time_visible REAL    DEFAULT 0,
  date             TEXT    NOT NULL,   
  UNIQUE(page_id, section_id, date)
);

CREATE TABLE IF NOT EXISTS builder_sections (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL,
  props_json TEXT NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()), variant TEXT,
  FOREIGN KEY(page_id) REFERENCES builder_pages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cache_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_id` text NOT NULL,
	`store_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`variant_id` integer,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price_snapshot` real,
	`title_snapshot` text,
	`image_snapshot` text,
	`variant_title_snapshot` text,
	`added_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE IF NOT EXISTS `carts` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` integer NOT NULL,
	`customer_id` integer,
	`visitor_id` text,
	`session_id` text,
	`currency` text DEFAULT 'BDT',
	`status` text DEFAULT 'active',
	`expires_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE IF NOT EXISTS `checkout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` integer NOT NULL,
	`cart_json` text NOT NULL,
	`customer_id` integer,
	`email` text,
	`phone` text,
	`customer_name` text,
	`shipping_address_json` text,
	`billing_address_json` text,
	`pricing_json` text,
	`discount_code` text,
	`payment_method` text DEFAULT 'cod',
	`status` text DEFAULT 'pending',
	`idempotency_key` text,
	`order_id` integer,
	`expires_at` integer,
	`landing_page_id` integer,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE IF NOT EXISTS `conversations` (
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

CREATE TABLE IF NOT EXISTS `credit_usage_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`metadata` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS "customers" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email TEXT,  
    name TEXT,
    phone TEXT,
    address TEXT,
    password_hash TEXT,
    google_id TEXT,
    auth_provider TEXT,
    last_login_at INTEGER,
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    last_order_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    risk_score INTEGER,
    risk_checked_at INTEGER,
    segment TEXT DEFAULT 'new',
    tags TEXT,
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'bronze',
    referred_by INTEGER
);

CREATE TABLE IF NOT EXISTS `discounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`code` text NOT NULL,
	`type` text DEFAULT 'percentage',
	`value` real NOT NULL,
	`min_order_amount` real,
	`max_discount_amount` real,
	`max_uses` integer,
	`used_count` integer DEFAULT 0,
	`per_customer_limit` integer DEFAULT 1,
	`starts_at` integer,
	`expires_at` integer,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `email_campaigns` (
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

CREATE TABLE IF NOT EXISTS `email_subscribers` (
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

CREATE TABLE IF NOT EXISTS `faqs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` integer NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS fdaas_api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_hash TEXT NOT NULL UNIQUE,   
    key_prefix TEXT NOT NULL,        
    name TEXT NOT NULL,              
    owner_email TEXT NOT NULL,       
    plan TEXT NOT NULL DEFAULT 'free', 
    monthly_limit INTEGER NOT NULL DEFAULT 100,  
    calls_this_month INTEGER NOT NULL DEFAULT 0, 
    calls_total INTEGER NOT NULL DEFAULT 0,      
    last_reset_at INTEGER,           
    last_used_at INTEGER,            
    is_active INTEGER NOT NULL DEFAULT 1, 
    metadata TEXT,                   
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS fdaas_usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL REFERENCES fdaas_api_keys(id) ON DELETE CASCADE,
    phone_hash TEXT NOT NULL,        
    risk_score INTEGER,              
    decision TEXT,                   
    response_ms INTEGER,             
    ip_address TEXT,                 
    created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS fraud_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  decision TEXT NOT NULL,
  signals TEXT,
  resolved_by TEXT,
  resolved_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS fraud_ip_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    cf_country TEXT,          
    cf_device_type TEXT,      
    user_agent TEXT,          
    risk_score INTEGER,       
    decision TEXT,            
    created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS `knowledge_sources` (
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

CREATE TABLE IF NOT EXISTS `landing_pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`project_data` text,
	`html_content` text,
	`css_content` text,
	`page_config` text,
	`is_published` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `lead_gen_forms` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `store_id` integer NOT NULL,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `fields` text DEFAULT '[]',
  `is_active` integer DEFAULT 1,
  `created_at` integer,
  `updated_at` integer,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `lead_submissions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `store_id` integer NOT NULL,
  `name` text NOT NULL,
  `email` text,
  `phone` text,
  `company` text,
  `form_data` text,
  `source` text DEFAULT 'contact_form',
  `form_id` text NOT NULL,
  `page_url` text,
  `status` text DEFAULT 'new',
  `assigned_to` integer,
  `notes` text,
  `utm_source` text,
  `utm_medium` text,
  `utm_campaign` text,
  `referrer` text,
  `ip_address` text,
  `user_agent` text,
  `ai_score` real,
  `ai_insights` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `contacted_at` integer,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE set null
);

CREATE TABLE IF NOT EXISTS "leads_data" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `location_inventory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`location_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`variant_id` integer,
	`quantity` integer DEFAULT 0 NOT NULL,
	`reserved_quantity` integer DEFAULT 0 NOT NULL,
	`reorder_point` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`address` text,
	`city` text,
	`district` text,
	`phone` text,
	`is_default` integer DEFAULT false,
	`is_active` integer DEFAULT true,
	`fulfillment_priority` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `loyalty_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`customer_id` integer NOT NULL,
	`points` integer NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`created_at` integer, reference_id TEXT,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `marketing_leads` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `source` text DEFAULT 'homepage',
  `ip_address` text,
  `user_agent` text,
  `created_at` integer
);

CREATE TABLE IF NOT EXISTS `marketplace_themes` (
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

CREATE TABLE IF NOT EXISTS "messages" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`function_name` text,
	`function_args` text,
	`function_result` text,
	`tokens_used` integer,
	`credits_used` integer DEFAULT 1,
	`created_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS metafield_definitions (
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

CREATE TABLE IF NOT EXISTS metafields (
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

CREATE TABLE IF NOT EXISTS "order_items" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` integer,
	`variant_id` integer,
	`title` text NOT NULL,
	`variant_title` text,
	`quantity` integer NOT NULL,
	`price` real NOT NULL,
	`total` real NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE IF NOT EXISTS `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`customer_id` integer,
	`order_number` text NOT NULL,
	`customer_email` text,
	`customer_phone` text,
	`customer_name` text,
	`shipping_address` text,
	`billing_address` text,
	`status` text DEFAULT 'pending',
	`payment_status` text DEFAULT 'pending',
	`subtotal` real NOT NULL,
	`tax` real DEFAULT 0,
	`shipping` real DEFAULT 0,
	`total` real NOT NULL,
	`notes` text,
	`created_at` integer,
	`updated_at` integer, `courier_provider` text, `courier_consignment_id` text, `courier_status` text, `landing_page_id` integer REFERENCES saved_landing_configs(id), `utm_source` text, `utm_medium` text, `utm_campaign` text, idempotency_key TEXT,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS page_analytics (
  id          TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  page_id     TEXT    NOT NULL REFERENCES builder_pages(id) ON DELETE CASCADE,
  store_id    INTEGER NOT NULL,
  event_type  TEXT    NOT NULL CHECK(event_type IN (
                'view', 'click', 'cta_click',
                'scroll_50', 'scroll_75', 'scroll_100',
                'section_view'
              )),
  section_id  TEXT,
  session_id  TEXT    NOT NULL,
  device_type TEXT    CHECK(device_type IN ('mobile', 'tablet', 'desktop')),
  country     TEXT,
  referrer    TEXT,
  metadata    TEXT,   
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "page_revisions" (
    id TEXT PRIMARY KEY,
    page_id INTEGER NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    
    content TEXT NOT NULL,
    
    
    revision_type TEXT NOT NULL DEFAULT 'auto', 
    description TEXT, 
    
    
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE TABLE IF NOT EXISTS `page_versions` (
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

CREATE TABLE IF NOT EXISTS page_views (
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

CREATE TABLE IF NOT EXISTS `password_resets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `payments` (
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

CREATE TABLE IF NOT EXISTS `payouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`period_start` integer NOT NULL,
	`period_end` integer NOT NULL,
	`gross_amount` real NOT NULL,
	`platform_fee` real DEFAULT 0,
	`net_amount` real NOT NULL,
	`status` text DEFAULT 'pending',
	`paid_at` integer,
	`payment_method` text,
	`payment_reference` text,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS phone_blacklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  reason TEXT,
  added_by TEXT DEFAULT 'merchant',
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS policy_versions (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  version INTEGER NOT NULL,
  label TEXT,
  policies_json TEXT NOT NULL,
  changed_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `product_collections` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `product_id` integer NOT NULL REFERENCES `products`(`id`) ON DELETE CASCADE,
  `collection_id` integer NOT NULL REFERENCES `collections`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `product_recommendations` (
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

CREATE TABLE IF NOT EXISTS `product_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`option1_name` text,
	`option1_value` text,
	`option2_name` text,
	`option2_value` text,
	`option3_name` text,
	`option3_value` text,
	`price` real,
	`compare_at_price` real,
	`sku` text,
	`inventory` integer DEFAULT 0,
	`image_url` text,
	`is_available` integer DEFAULT true,
	`created_at` integer, available INTEGER DEFAULT 0, reserved INTEGER DEFAULT 0,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`price` real NOT NULL,
	`compare_at_price` real,
	`inventory` integer DEFAULT 0,
	`sku` text,
	`image_url` text,
	`images` text,
	`category` text,
	`tags` text,
	`is_published` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer, `bundle_pricing` text,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "published_pages" (
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
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE IF NOT EXISTS `push_subscriptions` (
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

CREATE TABLE IF NOT EXISTS `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`customer_name` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`status` text DEFAULT 'pending',
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `saas_coupons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`discount_type` text NOT NULL,
	`discount_amount` real NOT NULL,
	`max_uses` integer,
	`used_count` integer DEFAULT 0,
	`expires_at` integer,
	`is_active` integer DEFAULT true,
	`created_at` integer
);

CREATE TABLE IF NOT EXISTS saved_blocks (
    id TEXT PRIMARY KEY,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'custom',
    description TEXT,
    
    
    content TEXT NOT NULL,
    
    
    thumbnail TEXT,
    
    
    usage_count INTEGER NOT NULL DEFAULT 0,
    
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE TABLE IF NOT EXISTS "saved_landing_configs" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`product_id` integer,
	`name` text NOT NULL,
	`landing_config` text NOT NULL,
	`offer_slug` text,
	`is_homepage_backup` integer DEFAULT false,
	`is_active` integer DEFAULT true,
	`view_count` integer DEFAULT 0,
	`orders` integer DEFAULT 0,
	`revenue` real DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE IF NOT EXISTS `shipments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`courier` text,
	`tracking_number` text,
	`status` text DEFAULT 'pending',
	`courier_data` text,
	`shipped_at` integer,
	`delivered_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `shipping_zones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`regions` text,
	`rate` real DEFAULT 0 NOT NULL,
	`free_above` real,
	`estimated_days` text,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `shop_domains` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`domain` text NOT NULL,
	`is_primary` integer DEFAULT false,
	`ssl_status` text DEFAULT 'pending',
	`verified_at` integer,
	`dns_verified` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS shopify_installations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_domain TEXT NOT NULL UNIQUE,
  store_id INTEGER REFERENCES stores(id),
  access_token_encrypted TEXT NOT NULL,
  access_token_iv TEXT NOT NULL,
  scopes TEXT NOT NULL,
  installed_at INTEGER,
  uninstalled_at INTEGER,
  webhooks_registered INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sms_suppression_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  phone_normalized TEXT NOT NULL,          
  opted_out_at INTEGER DEFAULT (unixepoch()),
  source TEXT DEFAULT 'customer'           
);

CREATE TABLE IF NOT EXISTS `staff_invites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'staff',
	`token` text NOT NULL,
	`invited_by` integer,
	`expires_at` integer,
	`accepted_at` integer,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS store_mvp_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  settings_json TEXT NOT NULL, 
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS store_settings_archives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  release_tag TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS store_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  note TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS `store_themes` (
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

CREATE TABLE IF NOT EXISTS store_users (
  id INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS `stores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`subdomain` text NOT NULL,
	`custom_domain` text,
	`plan_type` text DEFAULT 'free',
	`mode` text DEFAULT 'store',
	`featured_product_id` integer,
	`landing_config` text,
	`theme_config` text,
	`logo` text,
	`theme` text DEFAULT 'default',
	`currency` text DEFAULT 'USD',
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer
, `business_info` text, `favicon` text, `social_links` text, `font_family` text DEFAULT 'inter', `footer_config` text, subscription_status TEXT DEFAULT 'active', usage_limits TEXT, `cloudflare_hostname_id` text, `ssl_status` text DEFAULT 'pending', `dns_verified` integer DEFAULT false, `onboarding_status` text DEFAULT 'pending_plan', `setup_step` integer DEFAULT 0, `custom_privacy_policy` text, `custom_terms_of_service` text, `custom_refund_policy` text, `courier_settings` text, is_customer_ai_enabled INTEGER DEFAULT 0, ai_bot_persona TEXT, `shipping_config` text, `facebook_pixel_id` text, `deleted_at` integer, `google_analytics_id` text, `facebook_access_token` text, `homepage_builder_page_id` text, custom_google_client_id TEXT, custom_google_client_secret TEXT, marketing_config TEXT, loyalty_config TEXT, custom_shipping_policy TEXT, custom_subscription_policy TEXT, custom_legal_notice TEXT, storefront_settings TEXT, ai_credits INTEGER DEFAULT 50, fraud_settings TEXT);

CREATE TABLE IF NOT EXISTS student_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  document_type TEXT DEFAULT 'other',
  status TEXT DEFAULT 'uploaded' CHECK(status IN ('uploaded', 'reviewed', 'approved', 'rejected')),
  notes TEXT,
  reviewed_by INTEGER,
  reviewed_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),

  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `system_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` text NOT NULL,
	`message` text NOT NULL,
	`stack` text,
	`context` text,
	`created_at` integer
);

CREATE TABLE IF NOT EXISTS `system_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message` text NOT NULL,
	`type` text DEFAULT 'info',
	`is_active` integer DEFAULT true,
	`created_by` integer,
	`created_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `template_analytics` (
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

CREATE TABLE IF NOT EXISTS `template_sections_draft` (
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

CREATE TABLE IF NOT EXISTS `template_sections_published` (
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

CREATE TABLE IF NOT EXISTS template_versions (
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

CREATE TABLE IF NOT EXISTS `theme_presets` (
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

CREATE TABLE IF NOT EXISTS `theme_settings_draft` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`theme_id` text NOT NULL,
	`settings_json` text DEFAULT '{}',
	`version` integer DEFAULT 1,
	`updated_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `theme_settings_published` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`theme_id` text NOT NULL,
	`settings_json` text DEFAULT '{}',
	`published_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `theme_templates` (
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

CREATE TABLE IF NOT EXISTS `themes` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`name` text DEFAULT 'Default Theme' NOT NULL,
	`preset_id` text,
	`is_active` integer DEFAULT 1,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text,
	`store_id` integer,
	`role` text DEFAULT 'merchant',
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `visitor_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visitor_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `visitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`created_at` integer
);

CREATE TABLE IF NOT EXISTS wc_cart_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,                
  customer_phone TEXT,                     
  customer_email TEXT,                     
  items TEXT NOT NULL,                     
  total REAL NOT NULL DEFAULT 0,           
  converted INTEGER NOT NULL DEFAULT 0,    
  converted_at INTEGER,                    
  last_reminder_at INTEGER,                
  reminder_count INTEGER NOT NULL DEFAULT 0, 
  source TEXT DEFAULT 'woocommerce',       
  updated_at INTEGER,                      
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS wc_webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,                     
  wc_resource_id TEXT,                     
  payload TEXT NOT NULL,                   
  processed INTEGER NOT NULL DEFAULT 0,    
  processed_at INTEGER,                    
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS `webhook_delivery_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`webhook_id` integer NOT NULL,
	`event_type` text NOT NULL,
	`payload` text NOT NULL,
	`status_code` integer,
	`response_body` text,
	`success` integer DEFAULT false,
	`error_message` text,
	`attempt_count` integer DEFAULT 1,
	`delivered_at` integer,
	FOREIGN KEY (`webhook_id`) REFERENCES `webhooks`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `webhook_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer,
	`provider` text NOT NULL,
	`event_id` text NOT NULL,
	`event_type` text,
	`payload_json` text,
	`status` text DEFAULT 'processed',
	`processed_at` integer,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `webhooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`url` text NOT NULL,
	`topics` text NOT NULL,
	`secret` text NOT NULL,
	`is_active` integer DEFAULT true,
	`failure_count` integer DEFAULT 0,
	`created_at` integer, events TEXT, updated_at INTEGER DEFAULT (unixepoch()),
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);

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

CREATE TABLE IF NOT EXISTS wishlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS `ab_tests_status_idx` ON `ab_tests` (`store_id`,`status`);

CREATE INDEX IF NOT EXISTS `ab_tests_store_key_idx` ON `ab_tests` (`store_id`,`test_key`);

CREATE INDEX IF NOT EXISTS abandoned_carts_session_idx ON abandoned_carts(session_id);

CREATE INDEX IF NOT EXISTS abandoned_carts_status_idx ON abandoned_carts(store_id, status);

CREATE INDEX IF NOT EXISTS abandoned_carts_store_abandoned_idx ON abandoned_carts(store_id, abandoned_at);

CREATE INDEX IF NOT EXISTS abandoned_carts_store_id_idx ON abandoned_carts(store_id);

CREATE INDEX IF NOT EXISTS `activity_logs_store_id_idx` ON `activity_logs` (`store_id`);

CREATE INDEX IF NOT EXISTS `activity_logs_user_id_idx` ON `activity_logs` (`user_id`);

CREATE INDEX IF NOT EXISTS `admin_audit_logs_action_idx` ON `admin_audit_logs` (`store_id`,`action`);

CREATE INDEX IF NOT EXISTS `admin_audit_logs_actor_idx` ON `admin_audit_logs` (`actor_id`);

CREATE INDEX IF NOT EXISTS `admin_audit_logs_store_idx` ON `admin_audit_logs` (`store_id`);

CREATE INDEX IF NOT EXISTS admin_roles_user_idx ON admin_roles(user_id);

CREATE INDEX IF NOT EXISTS `agents_store_id_idx` ON `agents` (`store_id`);

CREATE INDEX IF NOT EXISTS `ai_conversations_agent_idx` ON `ai_conversations` (`agent_id`);

CREATE INDEX IF NOT EXISTS `ai_conversations_customer_idx` ON `ai_conversations` (`customer_id`);

CREATE INDEX IF NOT EXISTS `ai_conversations_store_idx` ON `ai_conversations` (`store_id`);

CREATE UNIQUE INDEX IF NOT EXISTS `checkout_sessions_idempotency_key_unique` ON `checkout_sessions` (`idempotency_key`);

CREATE INDEX IF NOT EXISTS `conversations_agent_id_idx` ON `conversations` (`agent_id`);

CREATE INDEX IF NOT EXISTS `conversations_phone_idx` ON `conversations` (`customer_phone`);

CREATE INDEX IF NOT EXISTS `conversations_session_idx` ON `conversations` (`session_id`);

CREATE INDEX IF NOT EXISTS customers_google_id_idx ON customers(store_id, google_id);

CREATE INDEX IF NOT EXISTS customers_segment_idx ON customers(store_id, segment);

CREATE INDEX IF NOT EXISTS customers_store_id_idx ON customers(store_id);

CREATE INDEX IF NOT EXISTS `discounts_code_idx` ON `discounts` (`store_id`,`code`);

CREATE INDEX IF NOT EXISTS `discounts_store_id_idx` ON `discounts` (`store_id`);

CREATE INDEX IF NOT EXISTS `email_campaigns_status_idx` ON `email_campaigns` (`store_id`,`status`);

CREATE INDEX IF NOT EXISTS `email_campaigns_store_id_idx` ON `email_campaigns` (`store_id`);

CREATE INDEX IF NOT EXISTS `email_subscribers_email_idx` ON `email_subscribers` (`store_id`,`email`);

CREATE INDEX IF NOT EXISTS `email_subscribers_store_id_idx` ON `email_subscribers` (`store_id`);

CREATE INDEX IF NOT EXISTS `faqs_agent_id_idx` ON `faqs` (`agent_id`);

CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_api_keys_expires ON api_keys(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_api_keys_plan ON api_keys(plan_id);

CREATE INDEX IF NOT EXISTS idx_api_subscriptions_plan ON api_subscriptions(plan_id);

CREATE INDEX IF NOT EXISTS idx_api_subscriptions_status ON api_subscriptions(status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_subscriptions_store ON api_subscriptions(store_id);

CREATE INDEX IF NOT EXISTS idx_builder_daily_page
  ON builder_page_daily_stats(page_id, date);

CREATE INDEX IF NOT EXISTS idx_builder_daily_store
  ON builder_page_daily_stats(store_id, date);

CREATE INDEX IF NOT EXISTS idx_builder_events_page
  ON builder_page_events(page_id, store_id, created_at);

CREATE INDEX IF NOT EXISTS idx_builder_events_store
  ON builder_page_events(store_id, created_at);

CREATE INDEX IF NOT EXISTS idx_builder_pages_last_published ON builder_pages(store_id, last_published_at);

CREATE INDEX IF NOT EXISTS idx_builder_pages_store
ON builder_pages(store_id);

CREATE INDEX IF NOT EXISTS idx_builder_section_page
  ON builder_section_stats(page_id, date);

CREATE INDEX IF NOT EXISTS idx_builder_sections_order
ON builder_sections(page_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_builder_sections_variant ON builder_sections(page_id, variant);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_store(expires_at);

CREATE INDEX IF NOT EXISTS `idx_cart_items_cart` ON `cart_items` (`cart_id`);

CREATE INDEX IF NOT EXISTS `idx_cart_items_product` ON `cart_items` (`product_id`);

CREATE INDEX IF NOT EXISTS `idx_carts_customer` ON `carts` (`customer_id`);

CREATE INDEX IF NOT EXISTS `idx_carts_status` ON `carts` (`store_id`,`status`);

CREATE INDEX IF NOT EXISTS `idx_carts_store` ON `carts` (`store_id`);

CREATE INDEX IF NOT EXISTS `idx_carts_visitor` ON `carts` (`visitor_id`);

CREATE INDEX IF NOT EXISTS `idx_checkout_sessions_expires` ON `checkout_sessions` (`expires_at`);

CREATE INDEX IF NOT EXISTS `idx_checkout_sessions_status` ON `checkout_sessions` (`store_id`,`status`);

CREATE INDEX IF NOT EXISTS `idx_checkout_sessions_store` ON `checkout_sessions` (`store_id`);

CREATE INDEX IF NOT EXISTS idx_fdaas_api_keys_email ON fdaas_api_keys(owner_email);

CREATE INDEX IF NOT EXISTS idx_fdaas_api_keys_hash ON fdaas_api_keys(key_hash);

CREATE INDEX IF NOT EXISTS idx_fdaas_api_keys_prefix ON fdaas_api_keys(key_prefix);

CREATE INDEX IF NOT EXISTS idx_fdaas_usage_created ON fdaas_usage_log(created_at);

CREATE INDEX IF NOT EXISTS idx_fdaas_usage_key ON fdaas_usage_log(api_key_id);

CREATE INDEX IF NOT EXISTS idx_fraud_events_order ON fraud_events(order_id);

CREATE INDEX IF NOT EXISTS idx_fraud_events_phone ON fraud_events(phone);

CREATE INDEX IF NOT EXISTS idx_fraud_events_store ON fraud_events(store_id);

CREATE INDEX IF NOT EXISTS idx_fraud_ip_events_ip ON fraud_ip_events(ip_address);

CREATE INDEX IF NOT EXISTS idx_fraud_ip_events_ip_created ON fraud_ip_events(ip_address, created_at);

CREATE INDEX IF NOT EXISTS idx_fraud_ip_events_phone ON fraud_ip_events(phone);

CREATE INDEX IF NOT EXISTS idx_fraud_ip_events_store ON fraud_ip_events(store_id);

CREATE INDEX IF NOT EXISTS `idx_lead_submissions_created` ON `lead_submissions` (`store_id`,`created_at`);

CREATE INDEX IF NOT EXISTS `idx_lead_submissions_email` ON `lead_submissions` (`email`);

CREATE INDEX IF NOT EXISTS `idx_lead_submissions_phone` ON `lead_submissions` (`phone`);

CREATE INDEX IF NOT EXISTS `idx_lead_submissions_source` ON `lead_submissions` (`store_id`,`source`);

CREATE INDEX IF NOT EXISTS `idx_lead_submissions_status` ON `lead_submissions` (`store_id`,`status`);

CREATE INDEX IF NOT EXISTS `idx_lead_submissions_store` ON `lead_submissions` (`store_id`);

CREATE INDEX IF NOT EXISTS `idx_location_inventory_location` ON `location_inventory` (`location_id`);

CREATE INDEX IF NOT EXISTS `idx_location_inventory_product` ON `location_inventory` (`product_id`);

CREATE INDEX IF NOT EXISTS `idx_location_inventory_variant` ON `location_inventory` (`variant_id`);

CREATE INDEX IF NOT EXISTS `idx_locations_active` ON `locations` (`store_id`,`is_active`);

CREATE INDEX IF NOT EXISTS `idx_locations_store` ON `locations` (`store_id`);

CREATE INDEX IF NOT EXISTS idx_loyalty_tx_reference ON loyalty_transactions(reference_id);

CREATE INDEX IF NOT EXISTS idx_metafield_definitions_owner_type 
  ON metafield_definitions(store_id, owner_type);

CREATE INDEX IF NOT EXISTS idx_metafield_definitions_store 
  ON metafield_definitions(store_id);

CREATE INDEX IF NOT EXISTS idx_metafields_namespace 
  ON metafields(store_id, namespace, key);

CREATE INDEX IF NOT EXISTS idx_metafields_owner 
  ON metafields(store_id, owner_type, owner_id);

CREATE INDEX IF NOT EXISTS idx_metafields_store 
  ON metafields(store_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mvp_settings_store ON store_mvp_settings(store_id);

CREATE INDEX IF NOT EXISTS idx_mvp_settings_updated ON store_mvp_settings(updated_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency 
ON orders(store_id, idempotency_key);

CREATE INDEX IF NOT EXISTS idx_page_analytics_page_event
  ON page_analytics(page_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_analytics_store
  ON page_analytics(store_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_revisions_created ON page_revisions(page_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_revisions_page ON page_revisions(page_id);

CREATE INDEX IF NOT EXISTS idx_page_revisions_store ON page_revisions(store_id);

CREATE INDEX IF NOT EXISTS idx_phone_blacklist_phone ON phone_blacklist(phone);

CREATE INDEX IF NOT EXISTS idx_phone_blacklist_store ON phone_blacklist(store_id);

CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id
  ON product_collections(collection_id);

CREATE INDEX IF NOT EXISTS idx_product_collections_product_id
  ON product_collections(product_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_collections_unique
  ON product_collections(product_id, collection_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_inventory 
ON product_variants(product_id, available);

CREATE INDEX IF NOT EXISTS idx_saved_blocks_category ON saved_blocks(store_id, category);

CREATE INDEX IF NOT EXISTS idx_saved_blocks_created ON saved_blocks(store_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_blocks_store ON saved_blocks(store_id);

CREATE INDEX IF NOT EXISTS idx_settings_archives_source ON store_settings_archives(store_id, source);

CREATE INDEX IF NOT EXISTS idx_settings_archives_store ON store_settings_archives(store_id);

CREATE INDEX IF NOT EXISTS `idx_shop_domains_domain` ON `shop_domains` (`domain`);

CREATE INDEX IF NOT EXISTS `idx_shop_domains_store` ON `shop_domains` (`store_id`);

CREATE INDEX IF NOT EXISTS idx_shopify_shop_domain ON shopify_installations(shop_domain);

CREATE INDEX IF NOT EXISTS idx_shopify_store_id ON shopify_installations(store_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sms_suppression_store_phone 
  ON sms_suppression_list(store_id, phone_normalized);

CREATE INDEX IF NOT EXISTS idx_stores_active_deleted ON stores(is_active, deleted_at);

CREATE INDEX IF NOT EXISTS idx_stores_custom_domain_deleted ON stores(custom_domain, deleted_at);

CREATE INDEX IF NOT EXISTS idx_stores_deleted_at ON stores(deleted_at);

CREATE INDEX IF NOT EXISTS idx_stores_subdomain_deleted ON stores(subdomain, deleted_at);

CREATE INDEX IF NOT EXISTS idx_student_documents_created ON student_documents(store_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_documents_customer ON student_documents(customer_id);

CREATE INDEX IF NOT EXISTS idx_student_documents_status ON student_documents(store_id, status);

CREATE INDEX IF NOT EXISTS idx_student_documents_store ON student_documents(store_id);

CREATE INDEX IF NOT EXISTS idx_student_documents_type ON student_documents(store_id, document_type);

CREATE INDEX IF NOT EXISTS `idx_template_sections_draft_order` ON `template_sections_draft` (`template_id`,`sort_order`);

CREATE INDEX IF NOT EXISTS `idx_template_sections_draft_template` ON `template_sections_draft` (`template_id`);

CREATE INDEX IF NOT EXISTS `idx_template_sections_published_order` ON `template_sections_published` (`template_id`,`sort_order`);

CREATE INDEX IF NOT EXISTS `idx_template_sections_published_template` ON `template_sections_published` (`template_id`);

CREATE INDEX IF NOT EXISTS idx_template_versions_store 
  ON template_versions(store_id);

CREATE INDEX IF NOT EXISTS idx_template_versions_template 
  ON template_versions(template_id);

CREATE INDEX IF NOT EXISTS idx_template_versions_theme 
  ON template_versions(theme_id, template_id, version DESC);

CREATE INDEX IF NOT EXISTS `idx_theme_presets_active` ON `theme_presets` (`is_active`);

CREATE INDEX IF NOT EXISTS `idx_theme_presets_category` ON `theme_presets` (`category`);

CREATE INDEX IF NOT EXISTS `idx_theme_settings_draft_theme` ON `theme_settings_draft` (`theme_id`);

CREATE INDEX IF NOT EXISTS `idx_theme_settings_published_theme` ON `theme_settings_published` (`theme_id`);

CREATE INDEX IF NOT EXISTS `idx_theme_templates_shop` ON `theme_templates` (`shop_id`);

CREATE INDEX IF NOT EXISTS `idx_theme_templates_theme` ON `theme_templates` (`theme_id`);

CREATE INDEX IF NOT EXISTS `idx_themes_active` ON `themes` (`shop_id`,`is_active`);

CREATE INDEX IF NOT EXISTS `idx_themes_shop` ON `themes` (`shop_id`);

CREATE INDEX IF NOT EXISTS idx_wc_cart_store_converted 
  ON wc_cart_sessions(store_id, converted);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wc_cart_store_session 
  ON wc_cart_sessions(store_id, session_id);

CREATE INDEX IF NOT EXISTS idx_wc_cart_updated 
  ON wc_cart_sessions(updated_at);

CREATE INDEX IF NOT EXISTS idx_wc_webhook_created 
  ON wc_webhook_events(created_at);

CREATE INDEX IF NOT EXISTS idx_wc_webhook_store_processed 
  ON wc_webhook_events(store_id, processed);

CREATE INDEX IF NOT EXISTS `idx_webhook_events_store` ON `webhook_events` (`store_id`,`created_at`);

CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_unique 
ON webhook_events(provider, event_id);

CREATE INDEX IF NOT EXISTS `knowledge_sources_agent_id_idx` ON `knowledge_sources` (`agent_id`);

CREATE INDEX IF NOT EXISTS `landing_pages_slug_idx` ON `landing_pages` (`store_id`,`slug`);

CREATE INDEX IF NOT EXISTS `landing_pages_store_id_idx` ON `landing_pages` (`store_id`);

CREATE INDEX IF NOT EXISTS `lead_gen_forms_slug_idx` ON `lead_gen_forms` (`store_id`, `slug`);

CREATE INDEX IF NOT EXISTS `lead_gen_forms_store_id_idx` ON `lead_gen_forms` (`store_id`);

CREATE INDEX IF NOT EXISTS `leads_data_conversation_id_idx` ON `leads_data` (`conversation_id`);

CREATE INDEX IF NOT EXISTS `leads_data_conversation_idx` ON `leads_data` (`conversation_id`);

CREATE INDEX IF NOT EXISTS `loyalty_tx_customer_idx` ON `loyalty_transactions` (`customer_id`);

CREATE INDEX IF NOT EXISTS `loyalty_tx_store_idx` ON `loyalty_transactions` (`store_id`);

CREATE UNIQUE INDEX IF NOT EXISTS `marketing_leads_email_idx` ON `marketing_leads` (`email`);

CREATE INDEX IF NOT EXISTS `messages_conversation_id_idx` ON `messages` (`conversation_id`);

CREATE INDEX IF NOT EXISTS `messages_conversation_idx` ON `messages` (`conversation_id`);

CREATE INDEX IF NOT EXISTS `order_items_order_id_idx` ON `order_items` (`order_id`);

CREATE INDEX IF NOT EXISTS `orders_customer_id_idx` ON `orders` (`customer_id`);

CREATE INDEX IF NOT EXISTS `orders_status_idx` ON `orders` (`store_id`,`status`);

CREATE INDEX IF NOT EXISTS orders_store_created_idx ON orders(store_id, created_at);

CREATE INDEX IF NOT EXISTS `orders_store_id_idx` ON `orders` (`store_id`);

CREATE INDEX IF NOT EXISTS `page_versions_store_id_idx` ON `page_versions` (`store_id`);

CREATE INDEX IF NOT EXISTS page_views_date_idx ON page_views(store_id, created_at);

CREATE INDEX IF NOT EXISTS page_views_store_created_idx ON page_views(store_id, created_at);

CREATE INDEX IF NOT EXISTS page_views_store_idx ON page_views(store_id);

CREATE INDEX IF NOT EXISTS page_views_visitor_idx ON page_views(store_id, visitor_id);

CREATE INDEX IF NOT EXISTS `password_resets_token_idx` ON `password_resets` (`token`);

CREATE UNIQUE INDEX IF NOT EXISTS `password_resets_token_unique` ON `password_resets` (`token`);

CREATE INDEX IF NOT EXISTS `password_resets_user_idx` ON `password_resets` (`user_id`);

CREATE INDEX IF NOT EXISTS policy_versions_store_id_idx ON policy_versions(store_id);

CREATE INDEX IF NOT EXISTS policy_versions_store_version_idx ON policy_versions(store_id, version);

CREATE INDEX IF NOT EXISTS `prod_recs_source_idx` ON `product_recommendations` (`store_id`,`source_product_id`);

CREATE INDEX IF NOT EXISTS product_variants_product_available_idx ON product_variants(product_id, is_available);

CREATE INDEX IF NOT EXISTS `product_variants_product_id_idx` ON `product_variants` (`product_id`);

CREATE INDEX IF NOT EXISTS `products_category_idx` ON `products` (`store_id`,`category`);

CREATE INDEX IF NOT EXISTS `products_store_id_idx` ON `products` (`store_id`);

CREATE INDEX IF NOT EXISTS products_store_published_idx ON products(store_id, is_published);

CREATE INDEX IF NOT EXISTS `published_pages_config_hash_idx` ON `published_pages` (`store_id`,`config_hash`);

CREATE INDEX IF NOT EXISTS `published_pages_store_id_idx` ON `published_pages` (`store_id`);

CREATE UNIQUE INDEX IF NOT EXISTS `push_subscriptions_endpoint_unique` ON `push_subscriptions` (`endpoint`);

CREATE INDEX IF NOT EXISTS `push_subscriptions_store_id_idx` ON `push_subscriptions` (`store_id`);

CREATE INDEX IF NOT EXISTS `push_subscriptions_user_id_idx` ON `push_subscriptions` (`user_id`);

CREATE INDEX IF NOT EXISTS `reviews_status_idx` ON `reviews` (`store_id`,`status`);

CREATE INDEX IF NOT EXISTS `reviews_store_product_idx` ON `reviews` (`store_id`,`product_id`);

CREATE INDEX IF NOT EXISTS `saas_coupons_code_idx` ON `saas_coupons` (`code`);

CREATE UNIQUE INDEX IF NOT EXISTS `saas_coupons_code_unique` ON `saas_coupons` (`code`);

CREATE INDEX IF NOT EXISTS `saved_landing_configs_slug_idx` ON `saved_landing_configs` (`store_id`,`offer_slug`);

CREATE INDEX IF NOT EXISTS `saved_landing_configs_store_id_idx` ON `saved_landing_configs` (`store_id`);

CREATE INDEX IF NOT EXISTS `shipments_order_id_idx` ON `shipments` (`order_id`);

CREATE INDEX IF NOT EXISTS `shipping_zones_store_id_idx` ON `shipping_zones` (`store_id`);

CREATE UNIQUE INDEX IF NOT EXISTS `shop_domains_domain_unique` ON `shop_domains` (`domain`);

CREATE INDEX IF NOT EXISTS `staff_invites_store_id_idx` ON `staff_invites` (`store_id`);

CREATE INDEX IF NOT EXISTS `staff_invites_token_idx` ON `staff_invites` (`token`);

CREATE UNIQUE INDEX IF NOT EXISTS `staff_invites_token_unique` ON `staff_invites` (`token`);

CREATE INDEX IF NOT EXISTS store_tags_store_idx ON store_tags(store_id);

CREATE INDEX IF NOT EXISTS store_tags_tag_idx ON store_tags(tag);

CREATE INDEX IF NOT EXISTS `store_themes_active_idx` ON `store_themes` (`store_id`,`is_active`);

CREATE INDEX IF NOT EXISTS `store_themes_store_id_idx` ON `store_themes` (`store_id`);

CREATE UNIQUE INDEX IF NOT EXISTS `stores_custom_domain_unique` ON `stores` (`custom_domain`);

CREATE UNIQUE INDEX IF NOT EXISTS `stores_subdomain_unique` ON `stores` (`subdomain`);

CREATE INDEX IF NOT EXISTS `template_analytics_store_id_idx` ON `template_analytics` (`store_id`);

CREATE INDEX IF NOT EXISTS `template_analytics_template_idx` ON `template_analytics` (`store_id`,`template_id`);

CREATE UNIQUE INDEX IF NOT EXISTS `uniq_theme_settings_draft` ON `theme_settings_draft` (`theme_id`);

CREATE UNIQUE INDEX IF NOT EXISTS `uniq_theme_settings_published` ON `theme_settings_published` (`theme_id`);

CREATE UNIQUE INDEX IF NOT EXISTS `uniq_theme_template_key` ON `theme_templates` (`theme_id`,`template_key`);

CREATE INDEX IF NOT EXISTS `users_email_idx` ON `users` (`email`);

CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);

CREATE INDEX IF NOT EXISTS `users_store_id_idx` ON `users` (`store_id`);

CREATE INDEX IF NOT EXISTS `visitor_messages_visitor_id_idx` ON `visitor_messages` (`visitor_id`);

CREATE INDEX IF NOT EXISTS `webhook_logs_event_idx` ON `webhook_delivery_logs` (`event_type`);

CREATE INDEX IF NOT EXISTS `webhook_logs_webhook_idx` ON `webhook_delivery_logs` (`webhook_id`);

CREATE INDEX IF NOT EXISTS wishlist_items_product_id_idx ON wishlist_items(product_id);

CREATE UNIQUE INDEX IF NOT EXISTS wishlist_items_unique_item ON wishlist_items(wishlist_id, product_id, variant_id);

CREATE INDEX IF NOT EXISTS wishlist_items_wishlist_id_idx ON wishlist_items(wishlist_id);

CREATE INDEX IF NOT EXISTS wishlists_customer_id_idx ON wishlists(customer_id);

CREATE INDEX IF NOT EXISTS wishlists_store_customer_idx ON wishlists(store_id, customer_id);

CREATE INDEX IF NOT EXISTS wishlists_store_id_idx ON wishlists(store_id);
