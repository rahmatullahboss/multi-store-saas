-- Migration: Add Sticky Order Button Settings to Page Builder
-- Date: 2026-01-25
-- Description: Adds configuration columns for the floating/sticky order button on landing pages.

ALTER TABLE builder_pages ADD COLUMN order_enabled INTEGER DEFAULT 0;
ALTER TABLE builder_pages ADD COLUMN order_text TEXT DEFAULT 'Order Now';
ALTER TABLE builder_pages ADD COLUMN order_bg_color TEXT DEFAULT '#000000';
ALTER TABLE builder_pages ADD COLUMN order_text_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE builder_pages ADD COLUMN button_position TEXT DEFAULT 'bottom-right';
