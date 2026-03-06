import type { ThemeConfig, SocialLinks, FooterConfig } from '@db/types';
import type { StoreCategory, StoreTemplateTheme } from '~/templates/store-registry';
import { FooterMarketplace } from './FooterMarketplace';

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
}: FooterSectionProps) {
  if (variant === 'marketplace') {
    return (
      <FooterMarketplace
        storeName={storeName}
        logo={logo}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
        categories={categories}
        planType={planType}
        footerConfig={footerConfig}
        theme={theme}
        paymentGateways={paymentGateways}
      />
    );
  }

  // Fallback default footer (simplified for now)
  return (
    <footer className="py-8 mt-12 text-center" style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
      <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
    </footer>
  );
}
