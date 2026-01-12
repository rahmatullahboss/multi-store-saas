-- Safe: Skip if columns already exist (SQLite limitation - run these individually)
-- These columns were already added manually or via another migration
-- Mark as applied by making them no-ops with comments

-- Columns already exist, so we just need to create the index if it doesn't exist
CREATE INDEX IF NOT EXISTS `customers_segment_idx` ON `customers` (`store_id`,`segment`);