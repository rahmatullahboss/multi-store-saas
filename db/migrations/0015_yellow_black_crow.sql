CREATE TABLE `saas_coupons` (
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
CREATE UNIQUE INDEX `saas_coupons_code_unique` ON `saas_coupons` (`code`);--> statement-breakpoint
CREATE INDEX `saas_coupons_code_idx` ON `saas_coupons` (`code`);--> statement-breakpoint
ALTER TABLE `stores` ADD `subscription_payment_method` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `subscription_start_date` integer;--> statement-breakpoint
ALTER TABLE `stores` ADD `subscription_end_date` integer;--> statement-breakpoint
ALTER TABLE `stores` ADD `admin_note` text;