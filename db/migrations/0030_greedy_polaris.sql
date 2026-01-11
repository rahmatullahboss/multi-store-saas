CREATE TABLE IF NOT EXISTS `marketplace_themes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`thumbnail` text,
	`config` text NOT NULL,
	`created_by` integer,
	`author_name` text,
	`is_public` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE set null
);
