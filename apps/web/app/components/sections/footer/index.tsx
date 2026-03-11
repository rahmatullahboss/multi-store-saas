import type { ThemeConfig, SocialLinks, FooterConfig } from '@db/types';
import type { StoreCategory, StoreTemplateTheme } from '~/templates/store-registry';
import { UnifiedFooter } from './UnifiedFooter';

interface FooterSectionProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | StoreCategory | null)[];
  planType?: string;
  footerConfig?: FooterConfig | null;
  theme: StoreTemplateTheme;
  variant?: 'default' | 'minimal' | 'bold' | 'marketplace' | 'luxury';
  paymentGateways?: string[];
  props?: {
    layout?: 'multi-column' | 'centered' | 'minimal';
    showNewsletter?: boolean;
  }
}

export function FooterSection({
  storeName,
  logo,
  socialLinks,
  businessInfo,
  categories = [],
  planType = 'free',
  footerConfig,
  theme,
  variant = 'default',
  paymentGateways = [],
  props = {},
}: FooterSectionProps) {
  
  // Resolve properties based on variant if not explicitly provided
  const resolvedLayout = props.layout || (variant === 'minimal' ? 'centered' : 'multi-column');
  const resolvedShowNewsletter = props.showNewsletter ?? false;

  return (
    <UnifiedFooter
      storeName={storeName}
      logo={logo}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      categories={categories}
      planType={planType}
      footerConfig={footerConfig}
      theme={theme}
      paymentGateways={paymentGateways}
      variant={variant}
      layout={resolvedLayout}
      showNewsletter={resolvedShowNewsletter}
    />
  );
}