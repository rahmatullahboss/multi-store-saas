CREATE TABLE stores (
CREATE TABLE products (
CREATE TABLE orders (
CREATE TABLE order_items (
CREATE TABLE d1_migrations(
CREATE TABLE users (
CREATE TABLE shipping_zones (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, name text NOT NULL, regions text, rate real DEFAULT 0 NOT NULL, free_above real, estimated_days text, is_active integer DEFAULT true, created_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade);
CREATE TABLE discounts (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, code text NOT NULL, type text DEFAULT 'percentage', value real NOT NULL, min_order_amount real, max_discount_amount real, max_uses integer, used_count integer DEFAULT 0, per_customer_limit integer DEFAULT 1, starts_at integer, expires_at integer, is_active integer DEFAULT true, created_at integer, updated_at integer, `is_flash_sale` integer DEFAULT false, `flash_sale_end_time` integer, `show_on_homepage` integer DEFAULT false, `flash_sale_title` text, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade);
CREATE TABLE shipments (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, order_id integer NOT NULL, courier text, tracking_number text, status text DEFAULT 'pending', courier_data text, shipped_at integer, delivered_at integer, created_at integer, updated_at integer, FOREIGN KEY (order_id) REFERENCES orders(id) ON UPDATE no action ON DELETE cascade);
CREATE TABLE staff_invites (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, email text NOT NULL, role text DEFAULT 'staff', token text NOT NULL UNIQUE, invited_by integer, expires_at integer, accepted_at integer, created_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade, FOREIGN KEY (invited_by) REFERENCES users(id) ON UPDATE no action ON DELETE no action);
CREATE TABLE activity_logs (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, user_id integer, action text NOT NULL, entity_type text, entity_id integer, details text, ip_address text, created_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade, FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action);
CREATE TABLE payouts (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, period_start integer NOT NULL, period_end integer NOT NULL, gross_amount real NOT NULL, platform_fee real DEFAULT 0, net_amount real NOT NULL, status text DEFAULT 'pending', paid_at integer, payment_method text, payment_reference text, notes text, created_at integer, updated_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade);
CREATE TABLE `abandoned_carts` (
CREATE TABLE `email_campaigns` (
CREATE TABLE `email_subscribers` (
CREATE TABLE product_variants (
CREATE TABLE `saved_landing_configs` (
CREATE TABLE reviews (
CREATE TABLE system_notifications (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, message text NOT NULL, type text DEFAULT 'info', is_active integer DEFAULT true, created_by integer, created_at integer, FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE no action ON DELETE no action);
CREATE TABLE saas_coupons (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, code TEXT NOT NULL UNIQUE, discount_type TEXT NOT NULL, discount_amount REAL NOT NULL, max_uses INTEGER, used_count INTEGER DEFAULT 0, expires_at INTEGER, is_active INTEGER DEFAULT 1, created_at INTEGER);
CREATE TABLE `ab_test_assignments` (
CREATE TABLE `ab_test_variants` (
CREATE TABLE `email_automation_steps` (
CREATE TABLE `email_automations` (
CREATE TABLE `email_queue` (
CREATE TABLE `order_bumps` (
CREATE TABLE `upsell_offers` (
CREATE TABLE `upsell_tokens` (
CREATE TABLE page_views (
CREATE TABLE admin_roles (
CREATE TABLE store_tags (
CREATE TABLE `marketing_leads` (
CREATE TABLE `payments` (
CREATE TABLE `api_keys` (
CREATE TABLE `system_logs` (
CREATE TABLE `webhooks` (
CREATE TABLE landing_pages (id INTEGER PRIMARY KEY AUTOINCREMENT, store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE, name TEXT NOT NULL, slug TEXT NOT NULL, project_data TEXT, html_content TEXT, css_content TEXT, is_published INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER, page_config TEXT);
CREATE TABLE `agents` (
CREATE TABLE `conversations` (
CREATE TABLE `faqs` (
CREATE TABLE `knowledge_sources` (
CREATE TABLE `visitor_messages` (
CREATE TABLE `visitors` (
CREATE TABLE `password_resets` (
CREATE TABLE `store_themes` (
CREATE TABLE `ai_conversations` (
CREATE TABLE loyalty_transactions (
CREATE TABLE `push_subscriptions` (
CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
CREATE TABLE `credit_usage_logs` (
CREATE TABLE `marketplace_themes` (
CREATE TABLE webhook_delivery_logs (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, webhook_id integer NOT NULL, event_type text NOT NULL, payload text NOT NULL, status_code integer, response_body text, success integer DEFAULT false, error_message text, attempt_count integer DEFAULT 1, delivered_at integer, FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE);
CREATE TABLE cache_store (
CREATE TABLE ai_cache (
CREATE TABLE `collections` (
CREATE TABLE `product_collections` (
CREATE TABLE webhook_events (
CREATE TABLE builder_pages (
CREATE TABLE builder_sections (
CREATE TABLE advanced_builder_pages (id text PRIMARY KEY NOT NULL, store_id integer NOT NULL, slug text NOT NULL, title text, product_id integer, status text DEFAULT 'draft', published_at integer, last_published_at integer, template_id text, seo_title text, seo_description text, og_image text, view_count integer DEFAULT 0, order_count integer DEFAULT 0, created_at integer, updated_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE cascade, FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE NO ACTION);
CREATE TABLE advanced_builder_sections (id text PRIMARY KEY NOT NULL, page_id text NOT NULL, type text NOT NULL, enabled integer DEFAULT 1 NOT NULL, sort_order integer NOT NULL, props_json text DEFAULT '{}' NOT NULL, blocks_json text DEFAULT '[]' NOT NULL, published_props_json text, published_blocks_json text, published_at integer, version integer DEFAULT 1 NOT NULL, created_at integer, updated_at integer, FOREIGN KEY (page_id) REFERENCES advanced_builder_pages(id) ON DELETE cascade);
CREATE TABLE IF NOT EXISTS "leads_data" (
CREATE TABLE IF NOT EXISTS "messages" (
CREATE TABLE `product_recommendations` (
CREATE TABLE IF NOT EXISTS "ab_tests" (
CREATE TABLE `published_pages` (
CREATE TABLE `page_versions` (
CREATE TABLE `template_analytics` (
CREATE TABLE IF NOT EXISTS "customers" (
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
CREATE INDEX idx_webhook_events_store 
CREATE UNIQUE INDEX idx_orders_idempotency 
CREATE INDEX idx_builder_pages_store
CREATE INDEX idx_builder_sections_order
CREATE INDEX idx_product_variants_inventory 
CREATE INDEX idx_adv_builder_pages_store ON advanced_builder_pages (store_id);
CREATE UNIQUE INDEX uniq_adv_builder_pages_slug ON advanced_builder_pages (store_id, slug);
CREATE INDEX idx_adv_builder_sections_page_order ON advanced_builder_sections (page_id, sort_order);
CREATE INDEX `ai_conversations_customer_idx` ON `ai_conversations` (`customer_id`);
CREATE INDEX `leads_data_conversation_idx` ON `leads_data` (`conversation_id`);
CREATE INDEX `messages_conversation_idx` ON `messages` (`conversation_id`);
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
CREATE INDEX idx_webhook_events_store 
CREATE UNIQUE INDEX idx_orders_idempotency 
CREATE INDEX idx_builder_pages_store
CREATE INDEX idx_builder_sections_order
CREATE INDEX idx_product_variants_inventory 
CREATE INDEX idx_adv_builder_pages_store ON advanced_builder_pages (store_id);
CREATE UNIQUE INDEX uniq_adv_builder_pages_slug ON advanced_builder_pages (store_id, slug);
CREATE INDEX idx_adv_builder_sections_page_order ON advanced_builder_sections (page_id, sort_order);
CREATE INDEX `ai_conversations_customer_idx` ON `ai_conversations` (`customer_id`);
CREATE INDEX `leads_data_conversation_idx` ON `leads_data` (`conversation_id`);
CREATE INDEX `messages_conversation_idx` ON `messages` (`conversation_id`);
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
