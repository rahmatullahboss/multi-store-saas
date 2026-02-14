-- Migration: Support Tickets System
-- Date: 2026-02-14

-- ============================================================================
-- SUPPORT TICKETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  
  -- Ticket details
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK(category IN ('billing', 'technical', 'account', 'feature', 'other')),
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Status tracking
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  
  -- Admin response
  assigned_to INTEGER,
  admin_response TEXT,
  resolved_at INTEGER,
  
  -- Metadata
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_store ON support_tickets(store_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
