-- These columns already exist in production, commenting out to prevent duplicate errors
-- ALTER TABLE `saved_landing_configs` ADD `is_active` integer DEFAULT true;
-- ALTER TABLE `saved_landing_configs` ADD `view_count` integer DEFAULT 0;

-- Ensure table exists before creating index (handles fresh DB where 0008 may be skipped)
CREATE TABLE IF NOT EXISTS `saved_landing_configs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `store_id` integer NOT NULL,
  `product_id` integer,
  `name` text NOT NULL,
  `landing_config` text NOT NULL,
  `offer_slug` text,
  `is_homepage_backup` integer DEFAULT false,
  `created_at` integer,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE NO ACTION
);
CREATE INDEX IF NOT EXISTS `saved_landing_configs_store_id_idx` ON `saved_landing_configs` (`store_id`);
CREATE INDEX IF NOT EXISTS `saved_landing_configs_slug_idx` ON `saved_landing_configs` (`store_id`,`offer_slug`);