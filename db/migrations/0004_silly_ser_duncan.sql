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
ALTER TABLE `discounts` ADD `is_flash_sale` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `discounts` ADD `flash_sale_end_time` integer;--> statement-breakpoint
ALTER TABLE `discounts` ADD `show_on_homepage` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `discounts` ADD `flash_sale_title` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `default_language` text DEFAULT 'en';--> statement-breakpoint
ALTER TABLE `stores` ADD `notification_email` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `email_notifications_enabled` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `stores` ADD `low_stock_threshold` integer DEFAULT 10;