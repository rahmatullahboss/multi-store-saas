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
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_order_items` (
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
INSERT INTO `__new_order_items`("id", "order_id", "product_id", "variant_id", "title", "variant_title", "quantity", "price", "total") SELECT "id", "order_id", "product_id", "variant_id", "title", "variant_title", "quantity", "price", "total" FROM `order_items`;--> statement-breakpoint
DROP TABLE `order_items`;--> statement-breakpoint
ALTER TABLE `__new_order_items` RENAME TO `order_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `__new_published_pages` (
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
INSERT INTO `__new_published_pages`("id", "store_id", "page_type", "product_id", "html_content", "css_content", "meta_tags", "template_id", "config_hash", "published_at", "expires_at", "created_at", "updated_at") SELECT "id", "store_id", "page_type", "product_id", "html_content", "css_content", "meta_tags", "template_id", "config_hash", "published_at", "expires_at", "created_at", "updated_at" FROM `published_pages`;--> statement-breakpoint
DROP TABLE `published_pages`;--> statement-breakpoint
ALTER TABLE `__new_published_pages` RENAME TO `published_pages`;--> statement-breakpoint
CREATE INDEX `published_pages_store_id_idx` ON `published_pages` (`store_id`);--> statement-breakpoint
CREATE INDEX `published_pages_config_hash_idx` ON `published_pages` (`store_id`,`config_hash`);--> statement-breakpoint
CREATE TABLE `__new_saved_landing_configs` (
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
INSERT INTO `__new_saved_landing_configs`("id", "store_id", "product_id", "name", "landing_config", "offer_slug", "is_homepage_backup", "is_active", "view_count", "orders", "revenue", "created_at") SELECT "id", "store_id", "product_id", "name", "landing_config", "offer_slug", "is_homepage_backup", "is_active", "view_count", "orders", "revenue", "created_at" FROM `saved_landing_configs`;--> statement-breakpoint
DROP TABLE `saved_landing_configs`;--> statement-breakpoint
ALTER TABLE `__new_saved_landing_configs` RENAME TO `saved_landing_configs`;--> statement-breakpoint
CREATE INDEX `saved_landing_configs_store_id_idx` ON `saved_landing_configs` (`store_id`);--> statement-breakpoint
CREATE INDEX `saved_landing_configs_slug_idx` ON `saved_landing_configs` (`store_id`,`offer_slug`);--> statement-breakpoint
CREATE TABLE `__new_customers` (
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
INSERT INTO `__new_customers`("id", "store_id", "email", "name", "phone", "address", "password_hash", "google_id", "auth_provider", "last_login_at", "risk_score", "risk_checked_at", "total_orders", "total_spent", "last_order_at", "segment", "tags", "loyalty_points", "loyalty_tier", "referred_by", "created_at", "updated_at") SELECT "id", "store_id", "email", "name", "phone", "address", "password_hash", "google_id", "auth_provider", "last_login_at", "risk_score", "risk_checked_at", "total_orders", "total_spent", "last_order_at", "segment", "tags", "loyalty_points", "loyalty_tier", "referred_by", "created_at", "updated_at" FROM `customers`;--> statement-breakpoint
DROP TABLE `customers`;--> statement-breakpoint
ALTER TABLE `__new_customers` RENAME TO `customers`;--> statement-breakpoint
CREATE INDEX `customers_store_id_idx` ON `customers` (`store_id`);--> statement-breakpoint
CREATE INDEX `customers_email_idx` ON `customers` (`store_id`,`email`);--> statement-breakpoint
CREATE INDEX `customers_segment_idx` ON `customers` (`store_id`,`segment`);--> statement-breakpoint
CREATE INDEX `customers_google_id_idx` ON `customers` (`store_id`,`google_id`);--> statement-breakpoint
-- NOTE:
-- `available`/`reserved` are added by `0049_inventory_reserve_system.sql`.
-- When applying the full migration chain from scratch, that migration runs before
-- this one, so re-adding would fail with "duplicate column name".
ALTER TABLE `products` ADD `bundle_pricing` text;--> statement-breakpoint
-- NOTE:
-- These are added by `0057_customer_auth.sql` in the canonical chain.
ALTER TABLE `stores` ADD `homepage_builder_page_id` text;
