import React from 'react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { StandardFooter } from '~/components/store-templates/shared/StandardFooter';
import { DEFAULT_THEME_CONFIG } from '../index'; 

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Footer (Daraz)',
  type: 'footer',
  limit: 1,

  settings: [
    {
      type: 'textarea',
      id: 'about_text',
      label: 'About text',
      default: 'South Asia\'s leading e-commerce marketplace.',
    },
    {
      type: 'checkbox',
      id: 'show_newsletter',
      label: 'Show newsletter signup',
      default: true,
    },
     {
      type: 'checkbox',
      id: 'show_trust_badges',
      label: 'Show Example Trust Badges',
      default: true,
    },
    {
       type: 'checkbox',
       id: 'show_powered_by',
       label: 'Show Powered By Ozzyl',
       default: true,
     },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function DarazFooter({ context, settings }: SectionComponentProps) {
  const { store } = context;
  const config = defaultThemeConfig; // Daraz might need a specific config export if not available

  // Cast store to any for potentially missing fields until schema is updated
  const storeAny = store as any;
  const businessInfo = {
      address: storeAny.address || 'House 123, Road 5, Gulshan, Dhaka 1212, Bangladesh',
      email: storeAny.email || 'hello@store.com',
      phone: storeAny.phone || '+880 1XXX-XXXXXX',
  };

  const socialLinks = {
    instagram: storeAny.instagram,
    facebook: storeAny.facebook,
    twitter: storeAny.twitter,
  };
  
  const categories = context.collections?.map(c => c.title) || [];

  const footerConfig = {
      description: settings.about_text as string,
      showPoweredBy: settings.show_powered_by !== false,
      showTrustBadges: settings.show_trust_badges !== false,
  }

  return (
    <StandardFooter
        storeName={store.name}
        logo={store.logo}
        config={config}
        socialLinks={socialLinks}
        footerConfig={footerConfig}
        businessInfo={businessInfo}
        categories={categories}
        planType={store.planType || 'free'}
    />
  );
}
