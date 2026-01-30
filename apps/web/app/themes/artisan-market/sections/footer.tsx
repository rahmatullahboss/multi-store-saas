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
      default: 'Curating the finest handmade goods from local artisans around the world.',
    },
    {
      type: 'checkbox',
      id: 'show_social',
      label: 'Show Social Media',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_newsletter',
      label: 'Show Newsletter',
      default: true,
    },
  ],
};

export default function ArtisanFooter({ context, settings }: SectionComponentProps) {
  const { store, collections } = context;

  const footerConfig = {
    showPoweredBy: true,
    showTrustBadges: true,
    description: settings.description as string,
    showNewsletter: settings.show_newsletter as boolean,
  };

  const socialLinks = store.socialLinks || null;
  const categories = collections?.map((c) => c.title) || [];

  return (
    <StandardFooter
      storeName={store.name}
      logo={store.logo}
      // @ts-ignore - ThemeConfig type compatibility is handled in StandardFooter
      config={context.theme}
      socialLinks={socialLinks}
      footerConfig={footerConfig}
      businessInfo={store.businessInfo || null}
      categories={categories}
    />
  );
}
