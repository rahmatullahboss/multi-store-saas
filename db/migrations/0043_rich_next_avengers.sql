-- These columns already exist in production, commenting out to prevent duplicate errors
-- ALTER TABLE `saved_landing_configs` ADD `is_active` integer DEFAULT true;
-- ALTER TABLE `saved_landing_configs` ADD `view_count` integer DEFAULT 0;
CREATE INDEX IF NOT EXISTS `saved_landing_configs_slug_idx` ON `saved_landing_configs` (`store_id`,`offer_slug`);