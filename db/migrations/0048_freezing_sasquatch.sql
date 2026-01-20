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
ALTER TABLE `stores` ADD `store_enabled` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `stores` ADD `home_entry` text DEFAULT 'store_home';--> statement-breakpoint
ALTER TABLE `stores` DROP COLUMN `mode`;