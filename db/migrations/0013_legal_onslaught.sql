ALTER TABLE `stores` ADD `shipping_config` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `facebook_pixel_id` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `is_customer_ai_enabled` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `stores` ADD `ai_bot_persona` text;