ALTER TABLE `stores` ADD `onboarding_status` text DEFAULT 'pending_plan';--> statement-breakpoint
ALTER TABLE `stores` ADD `setup_step` integer DEFAULT 0;