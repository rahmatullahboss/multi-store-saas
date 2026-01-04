-- Create abandoned_carts table
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
CREATE INDEX `abandoned_carts_store_id_idx` ON `abandoned_carts` (`store_id`);
--> statement-breakpoint
CREATE INDEX `abandoned_carts_session_idx` ON `abandoned_carts` (`session_id`);
--> statement-breakpoint
CREATE INDEX `abandoned_carts_status_idx` ON `abandoned_carts` (`store_id`, `status`);

-- Add language preference to stores
ALTER TABLE `stores` ADD COLUMN `default_language` text DEFAULT 'en';
