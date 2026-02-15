import { StandardFooter } from '~/components/store-templates/shared/StandardFooter';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export const schema: SectionSchema = {
  name: 'Footer',
  type: 'footer',
  limit: 1,

  settings: [
    {
      type: 'textarea',
      id: 'about_text',
      label: 'About text',
      default:
        'Curating timeless pieces for the discerning individual. Quality, elegance, and exceptional service since 2020.',
    },
    {
      type: 'checkbox',
      id: 'show_newsletter',
      label: 'Show newsletter signup',
      default: true,
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
      label: 'Show trust badges',
      default: true,
    },
  ],
};

export default function LuxeFooter({ context, settings }: SectionComponentProps) {
  const { store, collections } = context;

  const footerConfig = {
    description: settings.about_text as string,
    showPoweredBy: settings.show_powered_by !== false,
    showTrustBadges: settings.show_trust_badges !== false,
  };

  const socialLinks = store.socialLinks || null;
  const categories = collections?.map((c) => c.title) || [];

  return (
    <StandardFooter
      storeName={store.name}
      logo={store.logo}
      config={context.theme}
      socialLinks={socialLinks}
      footerConfig={footerConfig}
      businessInfo={store.businessInfo || null}
      categories={categories}
      planType={store.planType || 'free'}
      showNewsletter={settings.show_newsletter !== false}
    />
  );
}
