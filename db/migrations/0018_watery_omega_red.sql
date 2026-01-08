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
	`product_id` integer,
	`name` text NOT NULL,
	`status` text DEFAULT 'draft',
	`winning_variant_id` integer,
	`started_at` integer,
	`ended_at` integer,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ab_tests_store_idx` ON `ab_tests` (`store_id`);--> statement-breakpoint
CREATE INDEX `ab_tests_status_idx` ON `ab_tests` (`store_id`,`status`);--> statement-breakpoint
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
CREATE INDEX `upsell_tokens_token_idx` ON `upsell_tokens` (`token`);