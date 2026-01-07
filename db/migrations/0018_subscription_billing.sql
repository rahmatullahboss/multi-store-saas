-- Add subscription billing fields to stores table
ALTER TABLE `stores` ADD `subscription_payment_method` text;
ALTER TABLE `stores` ADD `subscription_start_date` integer;
ALTER TABLE `stores` ADD `subscription_end_date` integer;
ALTER TABLE `stores` ADD `admin_note` text;
