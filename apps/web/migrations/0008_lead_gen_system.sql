-- Migration: Lead Generation System
-- Created: 2026-02-12
-- Description: Add lead_submissions table and update stores table for lead gen support

-- ============================================================================
-- LEAD SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS lead_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  
  -- Contact Information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  
  -- Form Data (flexible JSON for custom fields)
  form_data TEXT, -- JSON: { message, budget, service_interest, etc. }
  
  -- Metadata
  source TEXT DEFAULT 'contact_form', -- 'contact_form', 'popup', 'footer', 'chat', 'hero-form'
  form_id TEXT NOT NULL, -- Which form was submitted (e.g., 'hero-form', 'contact-us')
  page_url TEXT, -- URL where form was submitted
  
  -- Status Tracking
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  assigned_to INTEGER, -- user_id of merchant/staff who is handling this lead
  notes TEXT, -- Merchant's private notes about this lead
  
  -- Marketing Attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- AI Enrichment (optional - powered by Workers AI)
  ai_score REAL, -- Lead quality score (0-1)
  ai_insights TEXT, -- JSON: { intent, budget_estimate, urgency, sentiment }
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  contacted_at INTEGER, -- When merchant first contacted the lead
  
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_lead_submissions_store ON lead_submissions(store_id);
CREATE INDEX idx_lead_submissions_status ON lead_submissions(store_id, status);
CREATE INDEX idx_lead_submissions_created ON lead_submissions(store_id, created_at DESC);
CREATE INDEX idx_lead_submissions_email ON lead_submissions(email);
CREATE INDEX idx_lead_submissions_phone ON lead_submissions(phone);
CREATE INDEX idx_lead_submissions_source ON lead_submissions(store_id, source);

-- ============================================================================
-- UPDATE STORES TABLE - Add lead_gen_config
-- ============================================================================
ALTER TABLE stores ADD COLUMN lead_gen_config TEXT;

-- Default lead gen config for existing stores (disabled by default)
-- Merchants need to explicitly enable it
-- JSON structure: 
-- {
--   "enabled": false,
--   "emailNotifications": true,
--   "notificationEmail": null,
--   "autoResponse": false,
--   "autoResponseTemplate": null,
--   "whatsapp": { "enabled": false, "phoneNumber": null }
-- }
