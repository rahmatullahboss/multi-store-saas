-- Add segment column to customers table for customer segmentation
ALTER TABLE `customers` ADD `segment` text DEFAULT 'new';
-->statement-breakpoint
-- Create index for efficient segment lookups
CREATE INDEX IF NOT EXISTS `customers_segment_idx` ON `customers` (`store_id`,`segment`);