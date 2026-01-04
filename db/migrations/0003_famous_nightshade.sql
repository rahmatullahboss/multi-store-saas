CREATE TABLE `activity_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`user_id` integer,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` integer,
	`details` text,
	`ip_address` text,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `activity_logs_store_id_idx` ON `activity_logs` (`store_id`);--> statement-breakpoint
CREATE INDEX `activity_logs_user_id_idx` ON `activity_logs` (`user_id`);--> statement-breakpoint
CREATE TABLE `discounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`code` text NOT NULL,
	`type` text DEFAULT 'percentage',
	`value` real NOT NULL,
	`min_order_amount` real,
	`max_discount_amount` real,
	`max_uses` integer,
	`used_count` integer DEFAULT 0,
	`per_customer_limit` integer DEFAULT 1,
	`starts_at` integer,
	`expires_at` integer,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `discounts_store_id_idx` ON `discounts` (`store_id`);--> statement-breakpoint
CREATE INDEX `discounts_code_idx` ON `discounts` (`store_id`,`code`);--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`courier` text,
	`tracking_number` text,
	`status` text DEFAULT 'pending',
	`courier_data` text,
	`shipped_at` integer,
	`delivered_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `shipments_order_id_idx` ON `shipments` (`order_id`);--> statement-breakpoint
CREATE TABLE `shipping_zones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`regions` text,
	`rate` real DEFAULT 0 NOT NULL,
	`free_above` real,
	`estimated_days` text,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `shipping_zones_store_id_idx` ON `shipping_zones` (`store_id`);--> statement-breakpoint
CREATE TABLE `staff_invites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'staff',
	`token` text NOT NULL,
	`invited_by` integer,
	`expires_at` integer,
	`accepted_at` integer,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_invites_token_unique` ON `staff_invites` (`token`);--> statement-breakpoint
CREATE INDEX `staff_invites_store_id_idx` ON `staff_invites` (`store_id`);--> statement-breakpoint
CREATE INDEX `staff_invites_token_idx` ON `staff_invites` (`token`);