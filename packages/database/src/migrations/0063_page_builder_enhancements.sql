-- ============================================================================
-- Migration: Page Builder Enhancements
-- Date: 2026-01-20
-- Description: Add saved_blocks table for reusable blocks and 
--              page_revisions table for version history
-- ============================================================================

-- ============================================================================
-- SAVED BLOCKS TABLE
-- Stores reusable block templates created by merchants
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_blocks (
    id TEXT PRIMARY KEY,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Block metadata
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'custom',
    description TEXT,
    
    -- Block content (GrapesJS JSON format)
    content TEXT NOT NULL,
    
    -- Preview thumbnail (optional)
    thumbnail TEXT,
    
    -- Usage tracking
    usage_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps (stored as Unix milliseconds)
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Indexes for saved_blocks
CREATE INDEX IF NOT EXISTS idx_saved_blocks_store ON saved_blocks(store_id);
CREATE INDEX IF NOT EXISTS idx_saved_blocks_category ON saved_blocks(store_id, category);
CREATE INDEX IF NOT EXISTS idx_saved_blocks_created ON saved_blocks(store_id, created_at DESC);

-- ============================================================================
-- PAGE REVISIONS TABLE
-- Stores version history for page edits
-- ============================================================================
CREATE TABLE IF NOT EXISTS page_revisions (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL REFERENCES builder_pages(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Revision content (full GrapesJS project data)
    content TEXT NOT NULL,
    
    -- Revision metadata
    revision_type TEXT NOT NULL DEFAULT 'auto', -- 'auto', 'manual', 'publish'
    description TEXT, -- User-provided description for manual saves
    
    -- Who created this revision
    created_by INTEGER REFERENCES store_users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Indexes for page_revisions
CREATE INDEX IF NOT EXISTS idx_page_revisions_page ON page_revisions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_revisions_store ON page_revisions(store_id);
CREATE INDEX IF NOT EXISTS idx_page_revisions_created ON page_revisions(page_id, created_at DESC);

-- ============================================================================
-- UPDATE builder_pages TABLE
-- Add column to track current revision
-- ============================================================================
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE, 
-- so we check if column exists first via application code
-- ALTER TABLE builder_pages ADD COLUMN current_revision_id TEXT REFERENCES page_revisions(id);
