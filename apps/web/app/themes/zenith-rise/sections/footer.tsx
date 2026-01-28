import { StandardFooter } from '~/components/store-templates/shared/StandardFooter';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export const schema: SectionSchema = {
  type: 'footer',
  name: 'Footer',
  settings: [
    {
      type: 'textarea',
      id: 'description',
      label: 'Description',
      default: 'Elevating your lifestyle with premium products designed for the modern world.',
    },
    {
      type: 'checkbox',
      id: 'show_social',
      label: 'Show Social Media',
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

export default function ZenithFooter({ context, settings }: SectionComponentProps) {
  const { store, collections } = context;
  
  // Zenith theme uses specific styling, but we wrap StandardFooter for consistency
  // while allowing theme config to drive the actual colors/fonts
  
  const footerConfig = {
    showPoweredBy: true,
    showTrustBadges: (settings.show_trust_badges as boolean) ?? true,
    description: settings.description as string,
  };

  const socialLinks = store.socialLinks ? JSON.parse(store.socialLinks) : null;
  const categories = collections?.map(c => c.title) || [];

  return (
    <StandardFooter
      storeName={store.name}
      logo={store.logo}
      // @ts-ignore - ThemeConfig type compatibility is handled in StandardFooter
      config={context.theme}
      socialLinks={socialLinks}
      footerConfig={footerConfig}
      businessInfo={store.businessInfo ? JSON.parse(store.businessInfo) : null}
      categories={categories}
    />
  );
}
