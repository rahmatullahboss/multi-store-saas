CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`phone` text,
	`address` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `customers_store_id_idx` ON `customers` (`store_id`);--> statement-breakpoint
CREATE INDEX `customers_email_idx` ON `customers` (`store_id`,`email`);--> statement-breakpoint
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
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE no action
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
	`subtotal` real NOT NULL,
	`tax` real DEFAULT 0,
	`shipping` real DEFAULT 0,
	`total` real NOT NULL,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `orders_store_id_idx` ON `orders` (`store_id`);--> statement-breakpoint
CREATE INDEX `orders_customer_id_idx` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`store_id`,`status`);--> statement-breakpoint
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
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `products_store_id_idx` ON `products` (`store_id`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`store_id`,`category`);--> statement-breakpoint
CREATE TABLE `stores` (
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
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stores_subdomain_unique` ON `stores` (`subdomain`);--> statement-breakpoint
CREATE UNIQUE INDEX `stores_custom_domain_unique` ON `stores` (`custom_domain`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text,
	`store_id` integer,
	`role` text DEFAULT 'merchant',
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_store_id_idx` ON `users` (`store_id`);