ALTER TABLE `loyalty_transactions` ADD `reference_id` text;--> statement-breakpoint
CREATE INDEX `loyalty_tx_type_idx` ON `loyalty_transactions` (`store_id`,`type`);--> statement-breakpoint
ALTER TABLE `stores` ADD `marketing_config` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `loyalty_config` text;