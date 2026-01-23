ALTER TABLE `stores` ADD `cloudflare_hostname_id` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `ssl_status` text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `stores` ADD `dns_verified` integer DEFAULT false;