CREATE TABLE IF NOT EXISTS `visitor_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visitor_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `visitor_messages_visitor_id_idx` ON `visitor_messages` (`visitor_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `visitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`created_at` integer
);
