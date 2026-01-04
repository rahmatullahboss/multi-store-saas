-- Add notification settings to stores table
ALTER TABLE `stores` ADD COLUMN `notification_email` text;
ALTER TABLE `stores` ADD COLUMN `email_notifications_enabled` integer DEFAULT true;
ALTER TABLE `stores` ADD COLUMN `low_stock_threshold` integer DEFAULT 10;
