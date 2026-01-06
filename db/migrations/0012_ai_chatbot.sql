-- Add AI chatbot fields to stores table
ALTER TABLE stores ADD COLUMN is_customer_ai_enabled INTEGER DEFAULT 0;
ALTER TABLE stores ADD COLUMN ai_bot_persona TEXT;
