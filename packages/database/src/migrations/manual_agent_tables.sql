CREATE TABLE IF NOT EXISTS `agents` (
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
CREATE INDEX IF NOT EXISTS `agents_store_id_idx` ON `agents` (`store_id`);

CREATE TABLE IF NOT EXISTS `conversations` (
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
CREATE INDEX IF NOT EXISTS `conversations_agent_id_idx` ON `conversations` (`agent_id`);
CREATE INDEX IF NOT EXISTS `conversations_phone_idx` ON `conversations` (`customer_phone`);
CREATE INDEX IF NOT EXISTS `conversations_session_idx` ON `conversations` (`session_id`);

CREATE TABLE IF NOT EXISTS `faqs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` integer NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `faqs_agent_id_idx` ON `faqs` (`agent_id`);

CREATE TABLE IF NOT EXISTS `knowledge_sources` (
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
CREATE INDEX IF NOT EXISTS `knowledge_sources_agent_id_idx` ON `knowledge_sources` (`agent_id`);

CREATE TABLE IF NOT EXISTS `leads_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`created_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `leads_data_conversation_id_idx` ON `leads_data` (`conversation_id`);

CREATE TABLE IF NOT EXISTS `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`created_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `messages_conversation_id_idx` ON `messages` (`conversation_id`);
