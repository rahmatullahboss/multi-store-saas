-- 0076_remove_ai_plan.sql
--
-- IMPORTANT (D1/SQLite compatibility):
-- - `ALTER TABLE ... DROP COLUMN` is not reliably supported across all D1/SQLite environments.
-- - Rebuilding the `stores` table (rename/create/copy/drop) can fail if the DB has legacy FK issues
--   (example: foreign keys referencing missing tables).
--
-- Production stance:
-- - The application no longer uses `stores.ai_plan`.
-- - If your database still has `ai_plan`, remove it during a controlled maintenance window after
--   confirming your schema integrity (all FK target tables exist).
--
-- Safe no-op (keeps migration chain moving without risking prod).
SELECT 1;

