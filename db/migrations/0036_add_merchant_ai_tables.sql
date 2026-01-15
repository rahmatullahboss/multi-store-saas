CREATE TABLE IF NOT EXISTS `ai_conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` integer NOT NULL,
	`store_id` integer NOT NULL,
	`customer_id` integer,
	`visitor_id` text,
	`customer_phone` text,
	`customer_name` text,
	`channel` text DEFAULT 'web',
	`external_id` text,
	`status` text DEFAULT 'active',
	`last_message_at` integer,
	`created_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ai_conversations_agent_idx` ON `ai_conversations` (`agent_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ai_conversations_store_idx` ON `ai_conversations` (`store_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ai_conversations_customer_idx` ON `ai_conversations` (`customer_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_leads_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_leads_data`("id", "conversation_id", "key", "value", "created_at") SELECT "id", "conversation_id", "key", "value", "created_at" FROM `leads_data`;--> statement-breakpoint
DROP TABLE `leads_data`;--> statement-breakpoint
ALTER TABLE `__new_leads_data` RENAME TO `leads_data`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `leads_data_conversation_idx` ON `leads_data` (`conversation_id`);--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`function_name` text,
	`function_args` text,
	`function_result` text,
	`tokens_used` integer,
	`credits_used` integer DEFAULT 1,
	`created_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_messages`("id", "conversation_id", "role", "content", "function_name", "function_args", "function_result", "tokens_used", "credits_used", "created_at") SELECT "id", "conversation_id", "role", "content", "function_name", "function_args", "function_result", "tokens_used", "credits_used", "created_at" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
CREATE INDEX `messages_conversation_idx` ON `messages` (`conversation_id`);--> statement-breakpoint
ALTER TABLE `agents` ADD `system_prompt` text;--> statement-breakpoint
ALTER TABLE `agents` ADD `tone` text DEFAULT 'friendly';--> statement-breakpoint
ALTER TABLE `agents` ADD `language` text DEFAULT 'bn';--> statement-breakpoint
ALTER TABLE `agents` ADD `objectives` text;--> statement-breakpoint
ALTER TABLE `agents` ADD `knowledge_base_id` text;--> statement-breakpoint
ALTER TABLE `agents` ADD `enabled_channels` text;--> statement-breakpoint
ALTER TABLE `agents` ADD `whatsapp_phone_id` text;--> statement-breakpoint
ALTER TABLE `agents` ADD `messenger_page_id` text;--> statement-breakpoint
ALTER TABLE `agents` DROP COLUMN `type`;--> statement-breakpoint
ALTER TABLE `agents` DROP COLUMN `platform_config`;