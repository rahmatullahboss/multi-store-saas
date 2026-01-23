-- Add page-level settings for floating buttons and custom HTML
-- This extends the builder_pages table with conversion tools

-- Floating button settings (WhatsApp/Call)
ALTER TABLE builder_pages ADD COLUMN whatsapp_enabled INTEGER DEFAULT 1;
ALTER TABLE builder_pages ADD COLUMN whatsapp_number TEXT;
ALTER TABLE builder_pages ADD COLUMN whatsapp_message TEXT;

ALTER TABLE builder_pages ADD COLUMN call_enabled INTEGER DEFAULT 1;
ALTER TABLE builder_pages ADD COLUMN call_number TEXT;

-- Custom HTML injection (controlled, not arbitrary scripts)
ALTER TABLE builder_pages ADD COLUMN custom_header_html TEXT;
ALTER TABLE builder_pages ADD COLUMN custom_footer_html TEXT;

-- Canonical URL for SEO
ALTER TABLE builder_pages ADD COLUMN canonical_url TEXT;

-- No-index flag
ALTER TABLE builder_pages ADD COLUMN no_index INTEGER DEFAULT 0;
