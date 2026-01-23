-- Migration: Add marketing_leads table for homepage email collector
CREATE TABLE IF NOT EXISTS `marketing_leads` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `source` text DEFAULT 'homepage',
  `ip_address` text,
  `user_agent` text,
  `created_at` integer
);

CREATE UNIQUE INDEX IF NOT EXISTS `marketing_leads_email_idx` ON `marketing_leads` (`email`);
