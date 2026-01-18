CREATE TABLE `template_sections_draft` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`template_id` text NOT NULL,
	`type` text NOT NULL,
	`enabled` integer DEFAULT 1,
	`sort_order` integer NOT NULL,
	`props_json` text DEFAULT '{}',
	`blocks_json` text DEFAULT '[]',
	`version` integer DEFAULT 1,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`template_id`) REFERENCES `theme_templates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_template_sections_draft_template` ON `template_sections_draft` (`template_id`);--> statement-breakpoint
CREATE INDEX `idx_template_sections_draft_order` ON `template_sections_draft` (`template_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `template_sections_published` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`template_id` text NOT NULL,
	`type` text NOT NULL,
	`enabled` integer DEFAULT 1,
	`sort_order` integer NOT NULL,
	`props_json` text DEFAULT '{}',
	`blocks_json` text DEFAULT '[]',
	`published_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`template_id`) REFERENCES `theme_templates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_template_sections_published_template` ON `template_sections_published` (`template_id`);--> statement-breakpoint
CREATE INDEX `idx_template_sections_published_order` ON `template_sections_published` (`template_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `theme_presets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`thumbnail_url` text,
	`category` text,
	`default_settings_json` text DEFAULT '{}',
	`default_templates_json` text DEFAULT '{}',
	`is_active` integer DEFAULT 1,
	`created_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_theme_presets_category` ON `theme_presets` (`category`);--> statement-breakpoint
CREATE INDEX `idx_theme_presets_active` ON `theme_presets` (`is_active`);--> statement-breakpoint
CREATE TABLE `theme_settings_draft` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`theme_id` text NOT NULL,
	`settings_json` text DEFAULT '{}',
	`version` integer DEFAULT 1,
	`updated_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_theme_settings_draft_theme` ON `theme_settings_draft` (`theme_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_theme_settings_draft` ON `theme_settings_draft` (`theme_id`);--> statement-breakpoint
CREATE TABLE `theme_settings_published` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`theme_id` text NOT NULL,
	`settings_json` text DEFAULT '{}',
	`published_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_theme_settings_published_theme` ON `theme_settings_published` (`theme_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_theme_settings_published` ON `theme_settings_published` (`theme_id`);--> statement-breakpoint
CREATE TABLE `theme_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`theme_id` text NOT NULL,
	`template_key` text NOT NULL,
	`title` text,
	`description` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_theme_templates_theme` ON `theme_templates` (`theme_id`);--> statement-breakpoint
CREATE INDEX `idx_theme_templates_shop` ON `theme_templates` (`shop_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_theme_template_key` ON `theme_templates` (`theme_id`,`template_key`);--> statement-breakpoint
CREATE TABLE `themes` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`name` text DEFAULT 'Default Theme' NOT NULL,
	`preset_id` text,
	`is_active` integer DEFAULT 1,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`shop_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_themes_shop` ON `themes` (`shop_id`);--> statement-breakpoint
CREATE INDEX `idx_themes_active` ON `themes` (`shop_id`,`is_active`);