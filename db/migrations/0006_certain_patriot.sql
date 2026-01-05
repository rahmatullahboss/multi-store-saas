ALTER TABLE `stores` ADD `custom_domain_request` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `custom_domain_status` text DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `stores` ADD `custom_domain_requested_at` integer;--> statement-breakpoint
ALTER TABLE `stores` ADD `subscription_status` text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `stores` ADD `usage_limits` text;