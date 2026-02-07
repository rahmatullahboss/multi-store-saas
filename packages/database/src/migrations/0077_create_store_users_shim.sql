-- 0077_create_store_users_shim.sql
--
-- Fix: Some historical migrations reference `store_users(id)` (e.g. page_revisions.created_by),
-- but the project uses `users` as the canonical table.
--
-- Problem:
-- - SQLite/D1 allows creating FKs that reference missing tables in some cases,
--   but later schema operations (ALTER/RENAME/rebuild or FK checks) can fail with:
--     "no such table: main.store_users"
--
-- Solution (production-safe, additive):
-- - Create a minimal `store_users` shim table that mirrors `users.id`.
-- - Backfill existing users.
-- - Add triggers to keep it in sync.
--
-- This keeps the legacy FK valid without rewriting existing tables.

PRAGMA foreign_keys=OFF;

CREATE TABLE IF NOT EXISTS store_users (
  id INTEGER PRIMARY KEY
);

-- Backfill existing users (id mirror)
INSERT OR IGNORE INTO store_users (id)
SELECT id FROM users;

-- Keep in sync: when a user is created, ensure store_users row exists
CREATE TRIGGER IF NOT EXISTS trg_store_users_after_insert_users
AFTER INSERT ON users
BEGIN
  INSERT OR IGNORE INTO store_users (id) VALUES (NEW.id);
END;

-- Keep in sync: when a user is deleted, remove store_users row
CREATE TRIGGER IF NOT EXISTS trg_store_users_after_delete_users
AFTER DELETE ON users
BEGIN
  DELETE FROM store_users WHERE id = OLD.id;
END;

PRAGMA foreign_keys=ON;

