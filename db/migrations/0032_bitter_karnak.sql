CREATE TABLE `store_themes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`template_id` text,
	`marketplace_theme_id` integer,
	`name` text NOT NULL,
	`config` text NOT NULL,
	`thumbnail` text,
	`is_active` integer DEFAULT false,
	`installed_at` integer,
	`last_used_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`marketplace_theme_id`) REFERENCES `marketplace_themes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `store_themes_store_id_idx` ON `store_themes` (`store_id`);--> statement-breakpoint
CREATE INDEX `store_themes_active_idx` ON `store_themes` (`store_id`,`is_active`);