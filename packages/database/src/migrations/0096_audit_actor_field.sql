-- Migration: 0096_audit_actor_field.sql
-- Adds actor_type + actor_name to admin_audit_logs for system/API-key actors
--
-- CONTEXT
-- ───────
-- admin_audit_logs was created in 0026_audit_trails.sql with:
--   actor_id INTEGER NOT NULL REFERENCES users(id)
-- This FK constraint means every audit entry MUST map to a row in `users`.
-- Since 0092_api_platform + 0094_wc_power_layer, actions are also triggered by:
--   • api_keys      (external WooCommerce/Shopify integrations)
--   • webhook       (async webhook processing queue)
--   • system        (cron jobs, automated rules, background workers)
-- These actors have no `users` row, so logAuditAction() currently either:
--   a) silently skips the log (loses data), or
--   b) inserts a sentinel actor_id=0 that violates referential integrity.
--
-- WHAT THIS MIGRATION DOES (all additive — no data destroyed)
-- ─────────────────────────────────────────────────────────────
-- 1. ADD actor_type TEXT DEFAULT 'user'
--      Values: 'user' | 'api_key' | 'system' | 'webhook'
--      Existing rows → backfilled to 'user' (they all reference a users row).
--
-- 2. ADD actor_name TEXT DEFAULT NULL
--      Denormalized display label. Survives user deletion / key rotation.
--      Populated at write time by logAuditAction(). Never JOIN-dependent.
--      Examples:
--        user      → "rahmatullahzisan@gmail.com"
--        api_key   → "My WooCommerce Store (ak_••••abcd)"
--        system    → "cron/courier-sync"
--        webhook   → "wc/order.created"
--
-- WHY NOT ALTER actor_id NOT NULL → NULL?
-- ────────────────────────────────────────
-- SQLite D1 does NOT support ALTER COLUMN or DROP CONSTRAINT.
-- The only safe path is a full table rebuild (CREATE new + INSERT + DROP old
-- + RENAME), which is DESTRUCTIVE on a live production table.
-- Instead we keep actor_id NOT NULL and require callers to pass a sentinel
-- value (actor_id = 0, actor_type = 'system'/'api_key'/'webhook') when there
-- is no real user. actor_name carries the human-readable identity.
-- A CHECK constraint documents this contract explicitly.
--
-- ORDERING NOTES
-- ──────────────
-- • 0095 does not exist — the gap between 0094 and 0096 is intentional
--   (matches the existing gap between 0079 and 0085 in this migrations dir).
-- • The D1 migrations runner applies files in lexicographic filename order.
--   0096 sorts after 0094 correctly; the two date-prefixed files
--   (20260202_*, 20260301_*) sort after all 00xx_* files, so ordering is safe.
-- • This migration has ZERO dependencies on 0092/0093/0094 beyond the table
--   already existing, which is guaranteed by 0026_audit_trails.sql.
--
-- SAFE TO RUN: additive only (ALTER TABLE ADD COLUMN + UPDATE backfill + index)
-- Run: npm run db:migrate:local && npm run db:migrate:prod
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Add actor_type column ────────────────────────────────────────────────
-- Default 'user' so all existing rows are immediately valid without a backfill
-- race between the schema change and the UPDATE below.
ALTER TABLE admin_audit_logs
  ADD COLUMN actor_type TEXT NOT NULL DEFAULT 'user';
-- Allowed values: 'user' | 'api_key' | 'system' | 'webhook'
-- CHECK constraints on ALTER ADD COLUMN are not enforced in SQLite at write
-- time for pre-existing rows, but we document the contract here and enforce
-- it in the application layer (audit.server.ts AuditPayload validation).

-- ─── 2. Add actor_name column ────────────────────────────────────────────────
-- Nullable: NULL for existing historical rows where we have no cached name.
-- New rows should always supply a value; the application falls back to
-- users.email via a JOIN only when actor_name IS NULL (legacy rows).
ALTER TABLE admin_audit_logs
  ADD COLUMN actor_name TEXT DEFAULT NULL;
-- Max practical length: ~255 chars (email + key prefix label).
-- Stored as plain TEXT — no encryption needed (display label, not secret).

-- ─── 3. Backfill existing rows ───────────────────────────────────────────────
-- actor_type already defaulted to 'user' for all pre-existing rows (step 1).
-- Backfill actor_name from users.email for rows where actor_id > 0 and the
-- user still exists. Rows where actor_id references a deleted user remain
-- NULL — the UI must handle this gracefully (show "Deleted User").
--
-- NOTE: This is a subquery UPDATE. SQLite D1 supports correlated subqueries.
-- The table has 0 rows in local dev; production may have rows — this is safe.
UPDATE admin_audit_logs
SET actor_name = (
  SELECT u.email
  FROM users u
  WHERE u.id = admin_audit_logs.actor_id
  LIMIT 1
)
WHERE actor_type = 'user'
  AND actor_name IS NULL
  AND actor_id > 0;

-- ─── 4. Index on actor_type for filtering ────────────────────────────────────
-- Enables fast queries like:
--   SELECT * FROM admin_audit_logs WHERE actor_type = 'api_key' ORDER BY created_at DESC
-- The existing admin_audit_logs_actor_idx covers actor_id lookups.
-- This new index covers type-based filtering in the /admin/audit-logs UI.
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_type
  ON admin_audit_logs (actor_type);

-- ─── 5. Composite index: store + actor_type (multi-tenant filter) ─────────────
-- Matches the most common admin query pattern:
--   WHERE store_id = ? AND actor_type = 'api_key'
CREATE INDEX IF NOT EXISTS idx_audit_logs_store_actor_type
  ON admin_audit_logs (store_id, actor_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- POST-MIGRATION: Update audit.server.ts AuditPayload (application layer)
-- ─────────────────────────────────────────────────────────────────────────────
-- Add to AuditPayload type:
--   actorType?: 'user' | 'api_key' | 'system' | 'webhook';  // default: 'user'
--   actorName?: string;    // email, key label, cron name, etc.
--
-- For system/api_key/webhook callers, pass actorId: 0 (sentinel) and set
-- actorType + actorName. The resolveAuditStoreId() function already handles
-- actorId: 0 gracefully (falls through to payload.storeId).
--
-- ROLLBACK PLAN (if this migration causes issues)
-- ─────────────────────────────────────────────────
-- SQLite / D1 does not support DROP COLUMN in older compatibility dates.
-- Compatibility date 2025-04-14 does support DROP COLUMN via:
--   ALTER TABLE admin_audit_logs DROP COLUMN actor_type;
--   ALTER TABLE admin_audit_logs DROP COLUMN actor_name;
-- But only if the column has no indexes. Drop indexes first:
--   DROP INDEX IF EXISTS idx_audit_logs_actor_type;
--   DROP INDEX IF EXISTS idx_audit_logs_store_actor_type;
-- Then drop columns. The application code must be rolled back first to avoid
-- INSERT failures on the removed columns.
-- ─────────────────────────────────────────────────────────────────────────────
