ALTER TABLE `orders` ADD `landing_page_id` integer REFERENCES saved_landing_configs(id);--> statement-breakpoint
ALTER TABLE `orders` ADD `utm_source` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `utm_medium` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `utm_campaign` text;