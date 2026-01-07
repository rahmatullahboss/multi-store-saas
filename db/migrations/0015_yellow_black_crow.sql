-- saas_coupons table and subscription columns
-- Fixed with IF NOT EXISTS to handle pre-existing objects

CREATE TABLE IF NOT EXISTS `saas_coupons` (
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
CREATE UNIQUE INDEX IF NOT EXISTS `saas_coupons_code_unique` ON `saas_coupons` (`code`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `saas_coupons_code_idx` ON `saas_coupons` (`code`);
--> statement-breakpoint
-- Columns already in production, skip:
-- ALTER TABLE `stores` ADD `subscription_payment_method` text;
-- ALTER TABLE `stores` ADD `subscription_start_date` integer;
-- ALTER TABLE `stores` ADD `subscription_end_date` integer;
-- ALTER TABLE `stores` ADD `admin_note` text;