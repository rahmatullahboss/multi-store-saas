ALTER TABLE `customers` ADD `total_orders` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `customers` ADD `total_spent` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `customers` ADD `last_order_at` integer;--> statement-breakpoint
ALTER TABLE `customers` ADD `segment` text DEFAULT 'new';--> statement-breakpoint
ALTER TABLE `customers` ADD `tags` text;--> statement-breakpoint
CREATE INDEX `customers_segment_idx` ON `customers` (`store_id`,`segment`);