CREATE TABLE `ai_cache` (
	`key` text PRIMARY KEY NOT NULL,
	`response` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_ai_cache_expires` ON `ai_cache` (`expires_at`);--> statement-breakpoint
CREATE TABLE `cache_store` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_cache_expires` ON `cache_store` (`expires_at`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `published_pages_store_id_idx` ON `published_pages` (`store_id`);--> statement-breakpoint
CREATE INDEX `published_pages_config_hash_idx` ON `published_pages` (`store_id`,`config_hash`);