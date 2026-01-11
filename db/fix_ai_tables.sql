-- Create Agents table if not exists with all columns
CREATE TABLE IF NOT EXISTS `agents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`agent_settings` text,
	`system_prompt` text,
	`tone` text DEFAULT 'friendly',
	`language` text DEFAULT 'bn',
	`objectives` text,
	`knowledge_base_id` text,
	`enabled_channels` text,
	`whatsapp_phone_id` text,
	`messenger_page_id` text,
	`is_active` integer DEFAULT 1,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade
);

-- Create AI Conversations table
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
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE set null
);

-- Create Messages table
CREATE TABLE IF NOT EXISTS `messages` (
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
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON DELETE cascade
);

-- Create Leads Data table
CREATE TABLE IF NOT EXISTS `leads_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON DELETE cascade
);

-- Indexes
CREATE INDEX IF NOT EXISTS `agents_store_id_idx` ON `agents` (`store_id`);
CREATE INDEX IF NOT EXISTS `ai_conversations_agent_idx` ON `ai_conversations` (`agent_id`);
CREATE INDEX IF NOT EXISTS `ai_conversations_store_idx` ON `ai_conversations` (`store_id`);
CREATE INDEX IF NOT EXISTS `messages_conversation_idx` ON `messages` (`conversation_id`);
