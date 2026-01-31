import React from 'react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { StandardFooter } from '~/components/store-templates/shared/StandardFooter';
import { NOVALUX_THEME } from '../index';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'footer',
  name: 'Footer',
  limit: 1,
  settings: [
    {
      type: 'textarea',
      id: 'description',
      label: 'Footer Description',
      default:
        'Curating exceptional products for those who appreciate the finer things in life. Experience luxury redefined.',
    },
    {
      type: 'checkbox',
      id: 'show_powered_by',
      label: 'Show Powered By Ozzyl',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_trust_badges',
      label: 'Show Trust Badges',
      default: true,
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function NovaLuxFooter({ context, settings }: SectionComponentProps) {
  const { store } = context;
  const config = NOVALUX_THEME.config;

  // Read business info from store.businessInfo (passed via ThemeStoreRenderer)
  const businessInfo = {
    address:
      store.businessInfo?.address ||
      store.address ||
      'House 123, Road 5, Gulshan, Dhaka 1212, Bangladesh',
    email: store.businessInfo?.email || store.email || 'hello@store.com',
    phone: store.businessInfo?.phone || store.phone || '+880 1XXX-XXXXXX',
  };

  // Read social links from store.socialLinks (passed via ThemeStoreRenderer)
  const socialLinks = {
    instagram: store.socialLinks?.instagram || store.instagram,
    facebook: store.socialLinks?.facebook || store.facebook,
    twitter: store.socialLinks?.twitter || store.twitter,
  };

  const categories = context.collections?.map((c) => c.title) || [];

  const footerConfig = {
    description: settings.description as string,
    showPoweredBy: settings.show_powered_by as boolean,
    showTrustBadges: settings.show_trust_badges as boolean,
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
