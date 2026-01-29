-- Migration: Add store branding fields (tagline, description)
-- bannerUrl already exists in themeConfig JSON, no need for separate column

-- Add tagline field for store slogan (SEO + branding)
ALTER TABLE stores ADD COLUMN tagline TEXT;

-- Add description field for SEO and about page
ALTER TABLE stores ADD COLUMN description TEXT;
