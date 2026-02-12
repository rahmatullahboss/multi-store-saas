-- ============================================================================
-- Create Lead Generation Demo Store
-- ============================================================================
-- Purpose: Create demo store for leads.ozzyl.com
-- Date: 2026-02-12
-- Run: wrangler d1 execute ozzyl-saas-db --file=./scripts/create-lead-gen-demo-store.sql
-- ============================================================================

-- Insert demo store
INSERT INTO stores (
  name,
  subdomain,
  custom_domain,
  home_entry,
  store_enabled,
  lead_gen_config,
  theme_config,
  currency,
  created_at,
  updated_at
) VALUES (
  'Ozzyl Lead Generation Demo',
  'leadsdemo',
  'leads.ozzyl.com',
  'lead_gen',
  0,
  '{
    "enabled": true,
    "themeId": "professional-services",
    "storeName": "Ozzyl Professional Services",
    "logo": null,
    "favicon": null,
    "primaryColor": "#2563EB",
    "accentColor": "#F59E0B",
    "heroHeading": "Grow Your Business with Expert Consulting",
    "heroDescription": "We help businesses scale with proven strategies and personalized solutions",
    "ctaButtonText": "Get Free Consultation",
    "showAnnouncement": true,
    "announcementText": "Limited time offer - Free consultation for new clients",
    "showTestimonials": true,
    "showServices": true,
    "phone": "+880 1234-567890",
    "email": "hello@ozzyl.com",
    "address": "Dhaka, Bangladesh"
  }',
  '{"storeTemplateId": "professional-services"}',
  'BDT',
  datetime('now'),
  datetime('now')
);

-- Verify creation
SELECT 
  id,
  name,
  subdomain,
  custom_domain,
  home_entry,
  store_enabled,
  created_at
FROM stores 
WHERE subdomain = 'leadsdemo';
