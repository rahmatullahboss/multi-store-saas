-- Migration number: 0066 	 2024-05-24T00:00:00.000Z
-- Add pricing_json column to orders table for detailed price breakdown

ALTER TABLE orders ADD COLUMN pricing_json TEXT;
