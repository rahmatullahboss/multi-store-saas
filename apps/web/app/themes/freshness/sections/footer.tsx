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
      default: 'Your one-stop shop for fresh, organic, and healthy groceries delivered to your doorstep.',
    },
    {
      type: 'checkbox',
      id: 'show_features',
      label: 'Show Features Bar',
      default: true,
    },
  ],
};

export default function FreshnessFooter({ context, settings }: SectionComponentProps) {
  const { store, collections } = context;
  
  const footerConfig = {
    showPoweredBy: true,
    showTrustBadges: (settings.show_features as boolean) ?? true,
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
