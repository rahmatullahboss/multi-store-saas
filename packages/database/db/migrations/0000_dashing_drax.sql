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
--> statement-breakpoint
CREATE INDEX `ab_test_assignments_visitor_idx` ON `ab_test_assignments` (`test_id`,`visitor_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `ab_test_variants_test_idx` ON `ab_test_variants` (`test_id`);--> statement-breakpoint
CREATE TABLE `ab_tests` (
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
--> statement-breakpoint
CREATE INDEX `ab_tests_store_key_idx` ON `ab_tests` (`store_id`,`test_key`);--> statement-breakpoint
CREATE INDEX `ab_tests_status_idx` ON `ab_tests` (`store_id`,`status`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `abandoned_carts_store_id_idx` ON `abandoned_carts` (`store_id`);--> statement-breakpoint
CREATE INDEX `abandoned_carts_session_idx` ON `abandoned_carts` (`session_id`);--> statement-breakpoint
CREATE INDEX `abandoned_carts_status_idx` ON `abandoned_carts` (`store_id`,`status`);--> statement-breakpoint
CREATE TABLE `activity_logs` (
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
--> statement-breakpoint
CREATE INDEX `activity_logs_store_id_idx` ON `activity_logs` (`store_id`);--> statement-breakpoint
CREATE INDEX `activity_logs_user_id_idx` ON `activity_logs` (`user_id`);--> statement-breakpoint
CREATE TABLE `admin_audit_logs` (
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
--> statement-breakpoint
CREATE INDEX `admin_audit_logs_store_idx` ON `admin_audit_logs` (`store_id`);--> statement-breakpoint
CREATE INDEX `admin_audit_logs_actor_idx` ON `admin_audit_logs` (`actor_id`);--> statement-breakpoint
CREATE INDEX `admin_audit_logs_action_idx` ON `admin_audit_logs` (`store_id`,`action`);--> statement-breakpoint
CREATE TABLE `admin_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`role` text NOT NULL,
	`permissions` text,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `admin_roles_user_idx` ON `admin_roles` (`user_id`);--> statement-breakpoint
CREATE TABLE `agents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`agent_settings` text,
	`system_prompt` text,
	`tone` text DEFAULT 'friendly',
	`language` text DEFAULT 'bn',
	`objectives` text,
	`knowledge_base_id` text,
	`enabled_channels` text,
	`whatsapp_phone_id` text,
	`messenger_page_id` text,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `agents_store_id_idx` ON `agents` (`store_id`);--> statement-breakpoint
CREATE TABLE `ai_cache` (
	`key` text PRIMARY KEY NOT NULL,
	`response` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_ai_cache_expires` ON `ai_cache` (`expires_at`);--> statement-breakpoint
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
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `ai_conversations_agent_idx` ON `ai_conversations` (`agent_id`);--> statement-breakpoint
CREATE INDEX `ai_conversations_store_idx` ON `ai_conversations` (`store_id`);--> statement-breakpoint
CREATE INDEX `ai_conversations_customer_idx` ON `ai_conversations` (`customer_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `app_installations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`app_id` integer NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text,
	`scopes` text,
	`status` text DEFAULT 'active',
	`installed_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `app_installations_store_id_idx` ON `app_installations` (`store_id`);--> statement-breakpoint
CREATE INDEX `app_installations_app_id_idx` ON `app_installations` (`app_id`);--> statement-breakpoint
CREATE TABLE `apps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`handle` text NOT NULL,
	`client_id` text NOT NULL,
	`client_secret` text NOT NULL,
	`redirect_url` text NOT NULL,
	`scopes` text,
	`developer_id` integer,
	`is_public` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `apps_handle_unique` ON `apps` (`handle`);--> statement-breakpoint
CREATE UNIQUE INDEX `apps_client_id_unique` ON `apps` (`client_id`);--> statement-breakpoint
CREATE TABLE `cache_store` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_cache_expires` ON `cache_store` (`expires_at`);--> statement-breakpoint
CREATE TABLE `cart_items` (
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
--> statement-breakpoint
CREATE INDEX `idx_cart_items_cart` ON `cart_items` (`cart_id`);--> statement-breakpoint
CREATE INDEX `idx_cart_items_product` ON `cart_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `carts` (
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
--> statement-breakpoint
CREATE INDEX `idx_carts_store` ON `carts` (`store_id`);--> statement-breakpoint
CREATE INDEX `idx_carts_customer` ON `carts` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_carts_visitor` ON `carts` (`visitor_id`);--> statement-breakpoint
CREATE INDEX `idx_carts_status` ON `carts` (`store_id`,`status`);--> statement-breakpoint
CREATE TABLE `checkout_sessions` (
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
--> statement-breakpoint
CREATE UNIQUE INDEX `checkout_sessions_idempotency_key_unique` ON `checkout_sessions` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_checkout_sessions_store` ON `checkout_sessions` (`store_id`);--> statement-breakpoint
CREATE INDEX `idx_checkout_sessions_status` ON `checkout_sessions` (`store_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_checkout_sessions_expires` ON `checkout_sessions` (`expires_at`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `collections_store_id_idx` ON `collections` (`store_id`);--> statement-breakpoint
CREATE INDEX `collections_slug_idx` ON `collections` (`store_id`,`slug`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`email` text,
	`name` text,
	`phone` text,
	`address` text,
	`password_hash` text,
	`google_id` text,
	`auth_provider` text,
	`last_login_at` integer,
	`risk_score` integer,
	`risk_checked_at` integer,
	`total_orders` integer DEFAULT 0,
	`total_spent` real DEFAULT 0,
	`last_order_at` integer,
	`segment` text DEFAULT 'new',
	`tags` text,
	`loyalty_points` integer DEFAULT 0,
	`loyalty_tier` text DEFAULT 'bronze',
	`referred_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `customers_store_id_idx` ON `customers` (`store_id`);--> statement-breakpoint
CREATE INDEX `customers_email_idx` ON `customers` (`store_id`,`email`);--> statement-breakpoint
CREATE INDEX `customers_segment_idx` ON `customers` (`store_id`,`segment`);--> statement-breakpoint
CREATE INDEX `customers_google_id_idx` ON `customers` (`store_id`,`google_id`);--> statement-breakpoint
CREATE TABLE `discounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`code` text NOT NULL,
	`type` text DEFAULT 'percentage',
	`rule_type` text DEFAULT 'standard',
	`value` real NOT NULL,
	`min_order_amount` real,
	`max_discount_amount` real,
	`max_uses` integer,
	`used_count` integer DEFAULT 0,
	`per_customer_limit` integer DEFAULT 1,
	`starts_at` integer,
	`expires_at` integer,
	`is_active` integer DEFAULT true,
	`is_flash_sale` integer DEFAULT false,
	`flash_sale_end_time` integer,
	`show_on_homepage` integer DEFAULT false,
	`flash_sale_title` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `discounts_store_id_idx` ON `discounts` (`store_id`);--> statement-breakpoint
CREATE INDEX `discounts_code_idx` ON `discounts` (`store_id`,`code`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `email_automation_steps_automation_idx` ON `email_automation_steps` (`automation_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `email_automations_store_idx` ON `email_automations` (`store_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `email_campaigns_store_id_idx` ON `email_campaigns` (`store_id`);--> statement-breakpoint
CREATE INDEX `email_campaigns_status_idx` ON `email_campaigns` (`store_id`,`status`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `email_queue_scheduled_idx` ON `email_queue` (`scheduled_at`,`status`);--> statement-breakpoint
CREATE INDEX `email_queue_store_idx` ON `email_queue` (`store_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `email_subscribers_store_id_idx` ON `email_subscribers` (`store_id`);--> statement-breakpoint
CREATE INDEX `email_subscribers_email_idx` ON `email_subscribers` (`store_id`,`email`);--> statement-breakpoint
CREATE TABLE `landing_pages` (
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
--> statement-breakpoint
CREATE INDEX `landing_pages_store_id_idx` ON `landing_pages` (`store_id`);--> statement-breakpoint
CREATE INDEX `landing_pages_slug_idx` ON `landing_pages` (`store_id`,`slug`);--> statement-breakpoint
CREATE TABLE `leads_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `leads_data_conversation_idx` ON `leads_data` (`conversation_id`);--> statement-breakpoint
CREATE TABLE `location_inventory` (
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
--> statement-breakpoint
CREATE INDEX `idx_location_inventory_location` ON `location_inventory` (`location_id`);--> statement-breakpoint
CREATE INDEX `idx_location_inventory_product` ON `location_inventory` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_location_inventory_variant` ON `location_inventory` (`variant_id`);--> statement-breakpoint
CREATE TABLE `locations` (
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
--> statement-breakpoint
CREATE INDEX `idx_locations_store` ON `locations` (`store_id`);--> statement-breakpoint
CREATE INDEX `idx_locations_active` ON `locations` (`store_id`,`is_active`);--> statement-breakpoint
CREATE TABLE `loyalty_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`customer_id` integer NOT NULL,
	`points` integer NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `loyalty_tx_customer_idx` ON `loyalty_transactions` (`customer_id`);--> statement-breakpoint
CREATE INDEX `loyalty_tx_store_idx` ON `loyalty_transactions` (`store_id`);--> statement-breakpoint
CREATE TABLE `marketing_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`source` text DEFAULT 'homepage',
	`ip_address` text,
	`user_agent` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `marketing_leads_email_unique` ON `marketing_leads` (`email`);--> statement-breakpoint
CREATE INDEX `marketing_leads_email_idx` ON `marketing_leads` (`email`);--> statement-breakpoint
CREATE TABLE `marketplace_themes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`thumbnail` text,
	`config` text NOT NULL,
	`created_by` integer,
	`author_name` text,
	`status` text DEFAULT 'pending',
	`is_public` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `messages` (
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
--> statement-breakpoint
CREATE INDEX `messages_conversation_idx` ON `messages` (`conversation_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `order_bumps_store_product_idx` ON `order_bumps` (`store_id`,`product_id`);--> statement-breakpoint
CREATE TABLE `order_items` (
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
--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
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
	`payment_method` text DEFAULT 'cod',
	`transaction_id` text,
	`manual_payment_details` text,
	`courier_provider` text,
	`courier_consignment_id` text,
	`courier_status` text,
	`subtotal` real NOT NULL,
	`tax` real DEFAULT 0,
	`shipping` real DEFAULT 0,
	`total` real NOT NULL,
	`pricing_json` text,
	`notes` text,
	`review_request_sent` integer DEFAULT false,
	`review_request_sent_at` integer,
	`landing_page_id` integer,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`landing_page_id`) REFERENCES `saved_landing_configs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `orders_store_id_idx` ON `orders` (`store_id`);--> statement-breakpoint
CREATE INDEX `orders_customer_id_idx` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`store_id`,`status`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `page_versions_store_id_idx` ON `page_versions` (`store_id`);--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`path` text NOT NULL,
	`visitor_id` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`referrer` text,
	`country` text,
	`city` text,
	`device_type` text,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `page_views_store_idx` ON `page_views` (`store_id`);--> statement-breakpoint
CREATE INDEX `page_views_date_idx` ON `page_views` (`store_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `page_views_visitor_idx` ON `page_views` (`store_id`,`visitor_id`);--> statement-breakpoint
CREATE TABLE `password_resets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `password_resets_token_unique` ON `password_resets` (`token`);--> statement-breakpoint
CREATE INDEX `password_resets_token_idx` ON `password_resets` (`token`);--> statement-breakpoint
CREATE INDEX `password_resets_user_idx` ON `password_resets` (`user_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `payouts` (
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
--> statement-breakpoint
CREATE TABLE `product_collections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`collection_id` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `prod_recs_source_idx` ON `product_recommendations` (`store_id`,`source_product_id`);--> statement-breakpoint
CREATE TABLE `product_variants` (
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
	`available` integer DEFAULT 0,
	`reserved` integer DEFAULT 0,
	`image_url` text,
	`is_available` integer DEFAULT true,
	`created_at` integer,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_variants_product_id_idx` ON `product_variants` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
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
	`seo_title` text,
	`seo_description` text,
	`seo_keywords` text,
	`bundle_pricing` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `products_store_id_idx` ON `products` (`store_id`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`store_id`,`category`);--> statement-breakpoint
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
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `published_pages_store_id_idx` ON `published_pages` (`store_id`);--> statement-breakpoint
CREATE INDEX `published_pages_config_hash_idx` ON `published_pages` (`store_id`,`config_hash`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE UNIQUE INDEX `push_subscriptions_endpoint_unique` ON `push_subscriptions` (`endpoint`);--> statement-breakpoint
CREATE INDEX `push_subscriptions_store_id_idx` ON `push_subscriptions` (`store_id`);--> statement-breakpoint
CREATE INDEX `push_subscriptions_user_id_idx` ON `push_subscriptions` (`user_id`);--> statement-breakpoint
CREATE TABLE `reviews` (
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
--> statement-breakpoint
CREATE INDEX `reviews_store_product_idx` ON `reviews` (`store_id`,`product_id`);--> statement-breakpoint
CREATE INDEX `reviews_status_idx` ON `reviews` (`store_id`,`status`);--> statement-breakpoint
CREATE TABLE `saas_coupons` (
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
--> statement-breakpoint
CREATE UNIQUE INDEX `saas_coupons_code_unique` ON `saas_coupons` (`code`);--> statement-breakpoint
CREATE INDEX `saas_coupons_code_idx` ON `saas_coupons` (`code`);--> statement-breakpoint
CREATE TABLE `saved_landing_configs` (
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
--> statement-breakpoint
CREATE INDEX `saved_landing_configs_store_id_idx` ON `saved_landing_configs` (`store_id`);--> statement-breakpoint
CREATE INDEX `saved_landing_configs_slug_idx` ON `saved_landing_configs` (`store_id`,`offer_slug`);--> statement-breakpoint
CREATE TABLE `shipments` (
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
--> statement-breakpoint
CREATE INDEX `shipments_order_id_idx` ON `shipments` (`order_id`);--> statement-breakpoint
CREATE TABLE `shipping_zones` (
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
--> statement-breakpoint
CREATE INDEX `shipping_zones_store_id_idx` ON `shipping_zones` (`store_id`);--> statement-breakpoint
CREATE TABLE `shop_domains` (
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
--> statement-breakpoint
CREATE UNIQUE INDEX `shop_domains_domain_unique` ON `shop_domains` (`domain`);--> statement-breakpoint
CREATE INDEX `idx_shop_domains_store` ON `shop_domains` (`store_id`);--> statement-breakpoint
CREATE INDEX `idx_shop_domains_domain` ON `shop_domains` (`domain`);--> statement-breakpoint
CREATE TABLE `staff_invites` (
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
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_invites_token_unique` ON `staff_invites` (`token`);--> statement-breakpoint
CREATE INDEX `staff_invites_store_id_idx` ON `staff_invites` (`store_id`);--> statement-breakpoint
CREATE INDEX `staff_invites_token_idx` ON `staff_invites` (`token`);--> statement-breakpoint
CREATE TABLE `store_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`tag` text NOT NULL,
	`note` text,
	`created_by` integer,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `store_tags_store_idx` ON `store_tags` (`store_id`);--> statement-breakpoint
CREATE INDEX `store_tags_tag_idx` ON `store_tags` (`tag`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `store_themes_store_id_idx` ON `store_themes` (`store_id`);--> statement-breakpoint
CREATE INDEX `store_themes_active_idx` ON `store_themes` (`store_id`,`is_active`);--> statement-breakpoint
CREATE TABLE `stores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`subdomain` text NOT NULL,
	`custom_domain` text,
	`custom_domain_request` text,
	`custom_domain_status` text DEFAULT 'none',
	`custom_domain_requested_at` integer,
	`cloudflare_hostname_id` text,
	`ssl_status` text DEFAULT 'pending',
	`dns_verified` integer DEFAULT false,
	`plan_type` text DEFAULT 'free',
	`subscription_status` text DEFAULT 'active',
	`usage_limits` text,
	`onboarding_status` text DEFAULT 'pending_plan',
	`setup_step` integer DEFAULT 0,
	`store_enabled` integer DEFAULT true,
	`home_entry` text DEFAULT 'store_home',
	`featured_product_id` integer,
	`landing_config` text,
	`landing_config_draft` text,
	`theme_config` text,
	`business_info` text,
	`logo` text,
	`theme` text DEFAULT 'default',
	`currency` text DEFAULT 'USD',
	`default_language` text DEFAULT 'en',
	`favicon` text,
	`social_links` text,
	`font_family` text DEFAULT 'inter',
	`footer_config` text,
	`custom_privacy_policy` text,
	`custom_terms_of_service` text,
	`custom_refund_policy` text,
	`notification_email` text,
	`email_notifications_enabled` integer DEFAULT true,
	`low_stock_threshold` integer DEFAULT 10,
	`shipping_config` text,
	`facebook_pixel_id` text,
	`facebook_access_token` text,
	`google_analytics_id` text,
	`monthly_visitor_count` integer DEFAULT 0,
	`visitor_count_reset_at` integer,
	`courier_settings` text,
	`manual_payment_config` text,
	`is_customer_ai_enabled` integer DEFAULT false,
	`ai_bot_persona` text,
	`ai_agent_request_status` text DEFAULT 'none',
	`ai_agent_requested_at` integer,
	`ai_plan` text,
	`ai_credits` integer DEFAULT 50,
	`custom_google_client_id` text,
	`custom_google_client_secret` text,
	`payment_transaction_id` text,
	`payment_status` text DEFAULT 'none',
	`payment_submitted_at` integer,
	`payment_amount` real,
	`payment_phone` text,
	`subscription_payment_method` text,
	`subscription_start_date` integer,
	`subscription_end_date` integer,
	`admin_note` text,
	`homepage_builder_page_id` text,
	`is_active` integer DEFAULT true,
	`deleted_at` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stores_subdomain_unique` ON `stores` (`subdomain`);--> statement-breakpoint
CREATE UNIQUE INDEX `stores_custom_domain_unique` ON `stores` (`custom_domain`);--> statement-breakpoint
CREATE TABLE `system_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` text NOT NULL,
	`message` text NOT NULL,
	`stack` text,
	`context` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `system_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message` text NOT NULL,
	`type` text DEFAULT 'info',
	`is_active` integer DEFAULT true,
	`created_by` integer,
	`created_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `template_analytics_store_id_idx` ON `template_analytics` (`store_id`);--> statement-breakpoint
CREATE INDEX `template_analytics_template_idx` ON `template_analytics` (`store_id`,`template_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `upsell_offers_store_product_idx` ON `upsell_offers` (`store_id`,`product_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE UNIQUE INDEX `upsell_tokens_token_unique` ON `upsell_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `upsell_tokens_token_idx` ON `upsell_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text,
	`phone` text,
	`store_id` integer,
	`role` text DEFAULT 'merchant',
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_store_id_idx` ON `users` (`store_id`);--> statement-breakpoint
CREATE TABLE `visitor_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visitor_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `visitor_messages_visitor_id_idx` ON `visitor_messages` (`visitor_id`);--> statement-breakpoint
CREATE TABLE `visitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `webhook_delivery_logs` (
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
--> statement-breakpoint
CREATE INDEX `webhook_logs_webhook_idx` ON `webhook_delivery_logs` (`webhook_id`);--> statement-breakpoint
CREATE INDEX `webhook_logs_event_idx` ON `webhook_delivery_logs` (`event_type`);--> statement-breakpoint
CREATE TABLE `webhook_events` (
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
--> statement-breakpoint
CREATE INDEX `idx_webhook_events_store` ON `webhook_events` (`store_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`app_installation_id` integer,
	`topic` text NOT NULL,
	`url` text NOT NULL,
	`secret` text,
	`format` text DEFAULT 'json',
	`is_active` integer DEFAULT true,
	`failure_count` integer DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`app_installation_id`) REFERENCES `app_installations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `webhooks_store_id_idx` ON `webhooks` (`store_id`);--> statement-breakpoint
CREATE INDEX `webhooks_topic_idx` ON `webhooks` (`store_id`,`topic`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `conversations_agent_id_idx` ON `conversations` (`agent_id`);--> statement-breakpoint
CREATE INDEX `conversations_phone_idx` ON `conversations` (`customer_phone`);--> statement-breakpoint
CREATE INDEX `conversations_session_idx` ON `conversations` (`session_id`);--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` integer NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `faqs_agent_id_idx` ON `faqs` (`agent_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `knowledge_sources_agent_id_idx` ON `knowledge_sources` (`agent_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `idx_template_sections_draft_template` ON `template_sections_draft` (`template_id`);--> statement-breakpoint
CREATE INDEX `idx_template_sections_draft_order` ON `template_sections_draft` (`template_id`,`sort_order`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `idx_template_sections_published_template` ON `template_sections_published` (`template_id`);--> statement-breakpoint
CREATE INDEX `idx_template_sections_published_order` ON `template_sections_published` (`template_id`,`sort_order`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `idx_theme_presets_category` ON `theme_presets` (`category`);--> statement-breakpoint
CREATE INDEX `idx_theme_presets_active` ON `theme_presets` (`is_active`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `idx_theme_settings_draft_theme` ON `theme_settings_draft` (`theme_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_theme_settings_draft` ON `theme_settings_draft` (`theme_id`);--> statement-breakpoint
CREATE TABLE `theme_settings_published` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`theme_id` text NOT NULL,
	`settings_json` text DEFAULT '{}',
	`published_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_theme_settings_published_theme` ON `theme_settings_published` (`theme_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_theme_settings_published` ON `theme_settings_published` (`theme_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `idx_theme_templates_theme` ON `theme_templates` (`theme_id`);--> statement-breakpoint
CREATE INDEX `idx_theme_templates_shop` ON `theme_templates` (`shop_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_theme_template_key` ON `theme_templates` (`theme_id`,`template_key`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `idx_themes_shop` ON `themes` (`shop_id`);--> statement-breakpoint
CREATE INDEX `idx_themes_active` ON `themes` (`shop_id`,`is_active`);