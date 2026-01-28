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
      default: 'সেরা মানের পণ্য, সেরা দামে! সীমিত সময়ের অফার।',
    },
    {
      type: 'checkbox',
      id: 'show_trust_badges',
      label: 'Show Trust Badges',
      default: true,
    },
  ],
};

export default function TurboFooter({ context, settings }: SectionComponentProps) {
  const { store, collections } = context;

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
      // @ts-ignore
      config={context.theme}
      socialLinks={socialLinks}
      footerConfig={footerConfig}
      businessInfo={store.businessInfo ? JSON.parse(store.businessInfo) : null}
      categories={categories}
    />
  );
}
