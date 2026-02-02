/**
 * Nova Lux Ultra Theme - Shopify 2.0 Version (For Store Design Page)
 *
 * NOTE: This is a minimal version for display in store design page.
 * The actual theme implementation is in the MVP system at:
 * apps/web/app/components/store-templates/nova-lux-ultra/
 */

import themeConfig from './theme.json';
import type { SectionSchema } from '~/lib/theme-engine/types';

// Minimal section for registration
const headerSchema: SectionSchema = {
  type: 'header',
  name: 'Header',
  settings: [
    { type: 'image_picker', id: 'logo', label: 'Logo' },
    { type: 'checkbox', id: 'show_search', label: 'Show Search', default: true },
    { type: 'checkbox', id: 'show_cart', label: 'Show Cart', default: true },
  ],
};

const heroSchema: SectionSchema = {
  type: 'hero-banner',
  name: 'Hero Banner',
  settings: [
    { type: 'text', id: 'heading', label: 'Heading', default: 'Welcome to Luxury' },
    { type: 'textarea', id: 'subheading', label: 'Subheading' },
    { type: 'image_picker', id: 'background_image', label: 'Background Image' },
  ],
  blocks: [
    {
      type: 'button',
      name: 'Button',
      settings: [
        { type: 'text', id: 'text', label: 'Text', default: 'Shop Now' },
        { type: 'url', id: 'link', label: 'Link', default: '/products' },
      ],
    },
  ],
  max_blocks: 2,
};

const footerSchema: SectionSchema = {
  type: 'footer',
  name: 'Footer',
  settings: [{ type: 'text', id: 'copyright', label: 'Copyright Text' }],
};

// Minimal component implementations
function Header() {
  return null; // Actual implementation is in MVP system
}

function HeroBanner() {
  return null; // Actual implementation is in MVP system
}

function Footer() {
  return null; // Actual implementation is in MVP system
}

export const theme = {
  id: 'nova-lux-ultra',
  config: themeConfig,
  sections: {
    header: { type: 'header', component: Header, schema: headerSchema },
    footer: { type: 'footer', component: Footer, schema: footerSchema },
    'hero-banner': { type: 'hero-banner', component: HeroBanner, schema: heroSchema },
  },
};

export default theme;
