-- ============================================================================
-- Migration: Genie Builder Enhancements
-- Date: 2026-01-21
-- Description: Add variant column to builder_sections and intent/style columns 
--              to builder_pages for Quick Builder v2 (Genie) support
-- ============================================================================

-- ============================================================================
-- UPDATE builder_sections TABLE
-- Add variant column for section variant tracking
-- ============================================================================
ALTER TABLE builder_sections ADD COLUMN variant TEXT;

-- ============================================================================
-- UPDATE builder_pages TABLE
-- Add intent and style columns for Genie Builder
-- ============================================================================

-- Intent data from Quick Builder wizard (JSON)
-- Stores: productType, goal, trafficSource
ALTER TABLE builder_pages ADD COLUMN intent_json TEXT;

-- Style tokens from Style Preferences step (JSON)
-- Stores: primaryColor, buttonStyle, fontFamily
ALTER TABLE builder_pages ADD COLUMN style_tokens_json TEXT;

-- ============================================================================
-- INDEXES for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_builder_sections_variant ON builder_sections(page_id, variant);
