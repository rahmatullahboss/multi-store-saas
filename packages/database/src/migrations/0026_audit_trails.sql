DROP TABLE IF EXISTS `admin_audit_logs`;
--> statement-breakpoint
CREATE TABLE `admin_audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL REFERENCES `stores`(`id`) ON DELETE cascade ON UPDATE no action,
	`actor_id` integer NOT NULL REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action,
	`action` text NOT NULL,
	`resource` text NOT NULL,
	`resource_id` text,
	`diff` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE INDEX `admin_audit_logs_store_idx` ON `admin_audit_logs` (`store_id`);
--> statement-breakpoint
CREATE INDEX `admin_audit_logs_actor_idx` ON `admin_audit_logs` (`actor_id`);
--> statement-breakpoint
CREATE INDEX `admin_audit_logs_action_idx` ON `admin_audit_logs` (`store_id`,`action`);
