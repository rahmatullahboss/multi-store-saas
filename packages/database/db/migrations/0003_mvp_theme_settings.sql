CREATE TABLE `store_mvp_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`theme_id` text DEFAULT 'starter-store' NOT NULL,
	`settings_json` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_mvp_settings_store` ON `store_mvp_settings` (`store_id`);
--> statement-breakpoint
CREATE INDEX `idx_mvp_settings_theme` ON `store_mvp_settings` (`store_id`,`theme_id`);
