-- Lead Generation MVP support
-- stores.lead_gen_config was added earlier in production manually,
-- so this migration keeps only idempotent table/index creation.

CREATE TABLE IF NOT EXISTS `lead_submissions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `store_id` integer NOT NULL,
  `name` text NOT NULL,
  `email` text,
  `phone` text,
  `company` text,
  `form_data` text,
  `source` text DEFAULT 'contact_form',
  `form_id` text NOT NULL,
  `page_url` text,
  `status` text DEFAULT 'new',
  `assigned_to` integer,
  `notes` text,
  `utm_source` text,
  `utm_medium` text,
  `utm_campaign` text,
  `referrer` text,
  `ip_address` text,
  `user_agent` text,
  `ai_score` real,
  `ai_insights` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `contacted_at` integer,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE set null
);

CREATE INDEX IF NOT EXISTS `idx_lead_submissions_store` ON `lead_submissions` (`store_id`);
CREATE INDEX IF NOT EXISTS `idx_lead_submissions_status` ON `lead_submissions` (`store_id`,`status`);
CREATE INDEX IF NOT EXISTS `idx_lead_submissions_created` ON `lead_submissions` (`store_id`,`created_at`);
CREATE INDEX IF NOT EXISTS `idx_lead_submissions_email` ON `lead_submissions` (`email`);
CREATE INDEX IF NOT EXISTS `idx_lead_submissions_phone` ON `lead_submissions` (`phone`);
CREATE INDEX IF NOT EXISTS `idx_lead_submissions_source` ON `lead_submissions` (`store_id`,`source`);
