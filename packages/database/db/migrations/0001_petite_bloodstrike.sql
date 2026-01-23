CREATE TABLE `customer_addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`type` text DEFAULT 'shipping',
	`first_name` text,
	`last_name` text,
	`company` text,
	`address1` text,
	`address2` text,
	`city` text,
	`province` text,
	`zip` text,
	`country` text,
	`phone` text,
	`is_default` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_customer_addresses_customer` ON `customer_addresses` (`customer_id`);--> statement-breakpoint
CREATE TABLE `customer_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`content` text NOT NULL,
	`author_name` text,
	`is_pinned` integer DEFAULT false,
	`created_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_customer_notes_customer` ON `customer_notes` (`customer_id`);--> statement-breakpoint
CREATE TABLE `customer_segments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`query` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_customer_segments_store` ON `customer_segments` (`store_id`);--> statement-breakpoint
ALTER TABLE `customers` ADD `status` text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `customers` ADD `notes` text;