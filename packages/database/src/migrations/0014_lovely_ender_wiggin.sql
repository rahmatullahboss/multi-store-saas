-- This migration adds payment-related columns
-- Some columns already exist in production, commenting them out

CREATE TABLE IF NOT EXISTS `system_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message` text NOT NULL,
	`type` text DEFAULT 'info',
	`is_active` integer DEFAULT true,
	`created_by` integer,
	`created_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
-- Note: These columns may already exist. SQLite doesn't support IF NOT EXISTS for columns.
-- If a column already exists, the migration will fail on that line.
-- Comment out any lines that cause duplicate column errors.

-- Already in production, skip: ALTER TABLE `orders` ADD `payment_method` text DEFAULT 'cod';
-- Already in production, skip: ALTER TABLE `orders` ADD `transaction_id` text;
-- Already in production, skip: ALTER TABLE `orders` ADD `manual_payment_details` text;
-- Already in production, skip: ALTER TABLE `stores` ADD `manual_payment_config` text;
-- Already in production, skip: ALTER TABLE `stores` ADD `payment_transaction_id` text;
-- Already in production, skip: ALTER TABLE `stores` ADD `payment_status` text DEFAULT 'none';
-- Already in production, skip: ALTER TABLE `stores` ADD `payment_submitted_at` integer;
-- Already in production, skip: ALTER TABLE `stores` ADD `payment_amount` real;
-- Already in production, skip: ALTER TABLE `stores` ADD `payment_phone` text;