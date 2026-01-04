-- Phase 3: Theme & Customization fields
ALTER TABLE `stores` ADD `favicon` text;
ALTER TABLE `stores` ADD `social_links` text;
ALTER TABLE `stores` ADD `font_family` text DEFAULT 'inter';
ALTER TABLE `stores` ADD `footer_config` text;
