import React from 'react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { StandardFooter } from '~/components/store-templates/shared/StandardFooter';
import { DEFAULT_THEME_CONFIG } from '../index';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Footer',
  type: 'footer',
  limit: 1,

  settings: [
    {
      type: 'textarea',
      id: 'about_text',
      label: 'About text',
      default: 'Cutting-edge technology and premium electronics for the modern world.',
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
      label: 'Show trust badges',
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

export default function TechFooter({ context, settings }: SectionComponentProps) {
  const { store } = context;
  const config = DEFAULT_THEME_CONFIG;

  const storeAny = store as any;
  const businessInfo = {
    address:
      storeAny.businessInfo?.address ||
      storeAny.address ||
      'House 123, Road 5, Gulshan, Dhaka 1212, Bangladesh',
    email: storeAny.businessInfo?.email || storeAny.email || 'hello@store.com',
    phone: storeAny.businessInfo?.phone || storeAny.phone || '+880 1XXX-XXXXXX',
  };

  const socialLinks = {
    instagram: storeAny.socialLinks?.instagram || storeAny.instagram,
    facebook: storeAny.socialLinks?.facebook || storeAny.facebook,
    twitter: storeAny.socialLinks?.twitter || storeAny.twitter,
  };

  const categories = context.collections?.map((c) => c.title) || [];

  const footerConfig = {
    description: settings.about_text as string,
    showPoweredBy: settings.show_powered_by !== false, // Default to true if undefined
    showTrustBadges: settings.show_trust_badges !== false, // Default to true if undefined
  };

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
