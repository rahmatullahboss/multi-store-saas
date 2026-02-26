-- Migration: 0017_drop_dead_builder_tables.sql
-- Date: 2026-02-18
-- Safe: advanced_builder_pages and advanced_builder_sections confirmed 0 rows
--       and zero code references in application code.
--
-- These tables were an intermediate architecture that was superseded by
-- builder_pages + builder_sections (migration 0046 in packages/database).
-- The `advanced_builder_*` tables were never used in production.
--
-- Rollback: restore from backup tables created in Step 1 below.

-- ============================================================================
-- Step 1: Create point-in-time backups (safe even if tables are empty)
-- ============================================================================
CREATE TABLE IF NOT EXISTS advanced_builder_pages_backup
  AS SELECT * FROM advanced_builder_pages;

CREATE TABLE IF NOT EXISTS advanced_builder_sections_backup
  AS SELECT * FROM advanced_builder_sections;

-- ============================================================================
-- Step 2: Drop dead tables (sections first due to FK dependency)
-- ============================================================================
DROP TABLE IF EXISTS advanced_builder_sections;
DROP TABLE IF EXISTS advanced_builder_pages;
