/**
 * Professional Services Adapters
 * 
 * Adapters to bridge Legacy Store Props (StoreHeaderProps/StoreFooterProps)
 * with New Theme Engine Props (SectionComponentProps).
 */

import type { StoreHeaderProps, StoreFooterProps } from '~/templates/store-registry';
import ProfessionalHeader from './sections/header';
import ProfessionalFooter from './sections/footer';

export function HeaderAdapter(props: StoreHeaderProps) {
  const context = {
    store: { name: props.storeName, id: 0, logo: props.logo }, // Mock ID if not passed
    page: { title: 'Home', handle: 'home', id: 0 },
    theme: props.config || {},
    getLink: (handle: string) => `/${handle}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  const section = {
    id: 'header-adapter',
    type: 'header',
    settings: {
      logo_url: props.logo,
      ...props.config,
    },
    blocks: [],
  };

  const navContext = {
    ...context,
    navigation: [], // Navigation would normally come from props or loader
  };

  return (
    <ProfessionalHeader 
        section={section} 
        context={navContext} 
        settings={section.settings}
        blocks={section.blocks}
    />
  );
}

export function FooterAdapter(props: StoreFooterProps) {
  const context = {
    store: { name: props.storeName, id: 0, logo: props.logo },
    page: { title: 'Home', handle: 'home', id: 0 },
    theme: props.themeColors || {},
    getLink: (handle: string) => `/${handle}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  const section = {
    id: 'footer-adapter',
    type: 'footer',
    settings: {
      footer_logo: props.logo,
      footer_description: props.businessInfo?.address || 'Leading education consultancy.',
      copyright_text: `© ${new Date().getFullYear()} ${props.storeName}. All rights reserved.`,
      ...props.footerConfig,
    },
    blocks: [],
  };

  return (
    <ProfessionalFooter 
        section={section} 
        context={context} 
        settings={section.settings}
        blocks={section.blocks}
    />
  );
}

export default {
    HeaderAdapter,
    FooterAdapter
};
