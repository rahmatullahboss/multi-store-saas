CREATE TABLE IF NOT EXISTS `loyalty_transactions` (
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
CREATE INDEX IF NOT EXISTS `loyalty_tx_customer_idx` ON `loyalty_transactions` (`customer_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `loyalty_tx_store_idx` ON `loyalty_transactions` (`store_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `prod_recs_source_idx` ON `product_recommendations` (`store_id`,`source_product_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ab_tests` (
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
INSERT INTO `__new_ab_tests`("id", "store_id", "name", "test_key", "variant_a", "variant_b", "traffic_split", "status", "views_a", "conversions_a", "views_b", "conversions_b", "winner", "started_at", "ended_at", "created_at") SELECT "id", "store_id", "name", "test_key", "variant_a", "variant_b", "traffic_split", "status", "views_a", "conversions_a", "views_b", "conversions_b", "winner", "started_at", "ended_at", "created_at" FROM `ab_tests`;--> statement-breakpoint
DROP TABLE `ab_tests`;--> statement-breakpoint
ALTER TABLE `__new_ab_tests` RENAME TO `ab_tests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ab_tests_store_key_idx` ON `ab_tests` (`store_id`,`test_key`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ab_tests_status_idx` ON `ab_tests` (`store_id`,`status`);--> statement-breakpoint
-- ALTER TABLE `customers` ADD `loyalty_points` integer DEFAULT 0;--> statement-breakpoint
-- ALTER TABLE `customers` ADD `loyalty_tier` text DEFAULT 'bronze';--> statement-breakpoint
-- ALTER TABLE `customers` ADD `referred_by` integer;--> statement-breakpoint
-- ALTER TABLE `discounts` ADD `rule_type` text DEFAULT 'standard';--> statement-breakpoint
-- ALTER TABLE `orders` ADD `review_request_sent` integer DEFAULT false;--> statement-breakpoint
-- ALTER TABLE `orders` ADD `review_request_sent_at` integer;