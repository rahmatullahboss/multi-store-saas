-- Collections tables already exist in production
-- ALTER TABLE saved_landing_configs additions below:
ALTER TABLE `saved_landing_configs` ADD `is_active` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `saved_landing_configs` ADD `view_count` integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX `saved_landing_configs_slug_idx` ON `saved_landing_configs` (`store_id`,`offer_slug`);