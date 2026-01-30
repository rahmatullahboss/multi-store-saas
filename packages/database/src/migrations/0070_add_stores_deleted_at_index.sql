-- Migration: Add index on stores.deleted_at for soft-delete performance
-- Created: 2026-01-30
-- Purpose: Optimize queries that filter by deletedAt IS NULL (tenant resolution, store listing)

-- ============================================================================
-- INDEX FOR SOFT DELETE QUERIES
-- ============================================================================
-- This index significantly speeds up tenant middleware queries like:
-- SELECT * FROM stores WHERE subdomain = ? AND deleted_at IS NULL
-- SELECT * FROM stores WHERE custom_domain = ? AND deleted_at IS NULL
-- SELECT * FROM stores WHERE is_active = 1 AND deleted_at IS NULL

CREATE INDEX IF NOT EXISTS idx_stores_deleted_at ON stores(deleted_at);

-- Composite index for common tenant resolution query pattern
CREATE INDEX IF NOT EXISTS idx_stores_subdomain_deleted ON stores(subdomain, deleted_at);

-- Composite index for custom domain lookup
CREATE INDEX IF NOT EXISTS idx_stores_custom_domain_deleted ON stores(custom_domain, deleted_at);

-- Composite index for active store listing (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_stores_active_deleted ON stores(is_active, deleted_at);
