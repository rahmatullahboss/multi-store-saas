-- Migration: Add payment tracking columns to stores table
-- These columns are needed for bKash payment verification during onboarding

ALTER TABLE `stores` ADD `payment_transaction_id` text;
-->statement-breakpoint
ALTER TABLE `stores` ADD `payment_status` text DEFAULT 'none';
-->statement-breakpoint
ALTER TABLE `stores` ADD `payment_submitted_at` integer;
-->statement-breakpoint
ALTER TABLE `stores` ADD `payment_amount` real;
-->statement-breakpoint
ALTER TABLE `stores` ADD `payment_phone` text;
