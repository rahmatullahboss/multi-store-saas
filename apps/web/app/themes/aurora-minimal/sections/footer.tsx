import { StandardFooter } from '~/components/store-templates/shared/StandardFooter';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export const schema: SectionSchema = {
  type: 'footer',
  name: 'Footer',
  limit: 1,
  settings: [
    {
      type: 'textarea',
      id: 'description',
      label: 'Footer Description',
      default: 'Essential fashion for the modern individual.',
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
      default: false,
    },
  ],
};

export default function AuroraMinimalFooter({ context, settings }: SectionComponentProps) {
  const { store, collections } = context;

  const footerConfig = {
      description: settings.description as string,
      showPoweredBy: settings.show_powered_by as boolean,
      showTrustBadges: settings.show_trust_badges as boolean,
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
        planType={store.planType || 'free'}
    />
  );
}
