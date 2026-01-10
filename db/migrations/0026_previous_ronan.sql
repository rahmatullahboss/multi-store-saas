CREATE TABLE `landing_pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`project_data` text,
	`html_content` text,
	`css_content` text,
	`page_config` text,
	`is_published` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `landing_pages_store_id_idx` ON `landing_pages` (`store_id`);--> statement-breakpoint
CREATE INDEX `landing_pages_slug_idx` ON `landing_pages` (`store_id`,`slug`);--> statement-breakpoint
CREATE TABLE `agents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'ecommerce',
	`platform_config` text,
	`agent_settings` text,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `agents_store_id_idx` ON `agents` (`store_id`);--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` integer NOT NULL,
	`customer_phone` text,
	`customer_fb_id` text,
	`session_id` text,
	`customer_name` text,
	`status` text DEFAULT 'active',
	`last_message_at` integer,
	`created_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `conversations_agent_id_idx` ON `conversations` (`agent_id`);--> statement-breakpoint
CREATE INDEX `conversations_phone_idx` ON `conversations` (`customer_phone`);--> statement-breakpoint
CREATE INDEX `conversations_session_idx` ON `conversations` (`session_id`);--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` integer NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `faqs_agent_id_idx` ON `faqs` (`agent_id`);--> statement-breakpoint
CREATE TABLE `knowledge_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`content` text,
	`status` text DEFAULT 'pending',
	`vector_id` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `knowledge_sources_agent_id_idx` ON `knowledge_sources` (`agent_id`);--> statement-breakpoint
CREATE TABLE `leads_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`created_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `leads_data_conversation_id_idx` ON `leads_data` (`conversation_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`created_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `messages_conversation_id_idx` ON `messages` (`conversation_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_admin_audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`actor_id` integer NOT NULL,
	`action` text NOT NULL,
	`resource` text NOT NULL,
	`resource_id` text,
	`diff` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_admin_audit_logs`("id", "store_id", "actor_id", "action", "resource", "resource_id", "diff", "ip_address", "user_agent", "created_at") SELECT "id", "store_id", "actor_id", "action", "resource", "resource_id", "diff", "ip_address", "user_agent", "created_at" FROM `admin_audit_logs`;--> statement-breakpoint
DROP TABLE `admin_audit_logs`;--> statement-breakpoint
ALTER TABLE `__new_admin_audit_logs` RENAME TO `admin_audit_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `admin_audit_logs_store_idx` ON `admin_audit_logs` (`store_id`);--> statement-breakpoint
CREATE INDEX `admin_audit_logs_actor_idx` ON `admin_audit_logs` (`actor_id`);--> statement-breakpoint
CREATE INDEX `admin_audit_logs_action_idx` ON `admin_audit_logs` (`store_id`,`action`);--> statement-breakpoint
ALTER TABLE `stores` ADD `landing_config_draft` text;