-- ============================================================================
-- Migration: Fix page_revisions FOREIGN KEY constraint
-- Date: 2026-02-09
-- Description: page_revisions.page_id was referencing builder_pages(id)
--              but the page builder uses landing_pages IDs (numeric).
--              This migration recreates the table with correct FK reference.
-- ============================================================================

-- Step 1: Create new table with correct FK reference
CREATE TABLE IF NOT EXISTS page_revisions_new (
    id TEXT PRIMARY KEY,
    page_id INTEGER NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
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

-- Step 2: Copy existing data (if any)
INSERT OR IGNORE INTO page_revisions_new
SELECT id, CAST(page_id AS INTEGER), store_id, content, revision_type, description, created_by, created_at
FROM page_revisions
WHERE page_id GLOB '[0-9]*';

-- Step 3: Drop old table
DROP TABLE IF EXISTS page_revisions;

-- Step 4: Rename new table
ALTER TABLE page_revisions_new RENAME TO page_revisions;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_page_revisions_page ON page_revisions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_revisions_store ON page_revisions(store_id);
CREATE INDEX IF NOT EXISTS idx_page_revisions_created ON page_revisions(page_id, created_at DESC);
