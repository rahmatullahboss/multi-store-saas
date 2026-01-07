CREATE TABLE `system_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message` text NOT NULL,
	`type` text DEFAULT 'info',
	`is_active` integer DEFAULT true,
	`created_by` integer,
	`created_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
-->statement-breakpoint
ALTER TABLE `orders` ADD `payment_method` text DEFAULT 'cod';-->statement-breakpoint
ALTER TABLE `orders` ADD `transaction_id` text;-->statement-breakpoint
ALTER TABLE `orders` ADD `manual_payment_details` text;-->statement-breakpoint
ALTER TABLE `stores` ADD `manual_payment_config` text;-->statement-breakpoint
ALTER TABLE `stores` ADD `payment_transaction_id` text;-->statement-breakpoint
ALTER TABLE `stores` ADD `payment_status` text DEFAULT 'none';-->statement-breakpoint
ALTER TABLE `stores` ADD `payment_submitted_at` integer;-->statement-breakpoint
ALTER TABLE `stores` ADD `payment_amount` real;-->statement-breakpoint
ALTER TABLE `stores` ADD `payment_phone` text;