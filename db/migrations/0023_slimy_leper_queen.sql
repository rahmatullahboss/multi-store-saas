CREATE TABLE `marketing_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`source` text DEFAULT 'homepage',
	`ip_address` text,
	`user_agent` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `marketing_leads_email_unique` ON `marketing_leads` (`email`);--> statement-breakpoint
CREATE INDEX `marketing_leads_email_idx` ON `marketing_leads` (`email`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'BDT',
	`status` text DEFAULT 'pending',
	`method` text DEFAULT 'manual',
	`transaction_id` text,
	`plan_type` text,
	`period_start` integer,
	`period_end` integer,
	`admin_note` text,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
