CREATE TABLE `page_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`config_json` text NOT NULL,
	`version_label` text,
	`created_by` integer,
	`published_at` integer,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `page_versions_store_id_idx` ON `page_versions` (`store_id`);--> statement-breakpoint
CREATE TABLE `template_analytics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`template_id` text NOT NULL,
	`page_views` integer DEFAULT 0,
	`unique_visitors` integer DEFAULT 0,
	`orders_generated` integer DEFAULT 0,
	`revenue_generated` real DEFAULT 0,
	`conversion_rate` real DEFAULT 0,
	`period_start` integer,
	`period_end` integer,
	`updated_at` integer,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `template_analytics_store_id_idx` ON `template_analytics` (`store_id`);--> statement-breakpoint
CREATE INDEX `template_analytics_template_idx` ON `template_analytics` (`store_id`,`template_id`);