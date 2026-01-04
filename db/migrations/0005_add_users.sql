-- Migration: Add users table for merchant authentication
-- Version: 0005

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'merchant',
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_store_id_idx ON users(store_id);
