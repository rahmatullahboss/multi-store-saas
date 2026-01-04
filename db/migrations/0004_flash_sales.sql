-- Add flash sale columns to discounts table
ALTER TABLE `discounts` ADD COLUMN `is_flash_sale` integer DEFAULT false;
ALTER TABLE `discounts` ADD COLUMN `flash_sale_end_time` integer;
ALTER TABLE `discounts` ADD COLUMN `show_on_homepage` integer DEFAULT false;
ALTER TABLE `discounts` ADD COLUMN `flash_sale_title` text;
