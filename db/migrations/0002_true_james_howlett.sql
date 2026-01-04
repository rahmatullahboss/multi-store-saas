CREATE TABLE `payouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`period_start` integer NOT NULL,
	`period_end` integer NOT NULL,
	`gross_amount` real NOT NULL,
	`platform_fee` real DEFAULT 0,
	`net_amount` real NOT NULL,
	`status` text DEFAULT 'pending',
	`paid_at` integer,
	`payment_method` text,
	`payment_reference` text,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
