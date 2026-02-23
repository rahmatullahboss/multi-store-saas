import { StandardFooter } from '~/components/store-templates/shared/StandardFooter';
import { SOKOL_THEME } from '../theme';
import type { SocialLinks, FooterConfig } from '@db/types';

interface StoreFooterProps {
  storeName: string;
  logo?: string | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  socialLinks?: SocialLinks | null;
  categories: (string | null)[];
  planType?: string;
  footerConfig?: FooterConfig | null;
}

export function SokolFooter({
  storeName,
  logo,
  businessInfo,
  socialLinks,
  categories = [],
  planType = 'free',
  footerConfig,
}: StoreFooterProps) {
  const theme = SOKOL_THEME;
  // Ensure config has colors derived from theme
  const config = {
    colors: {
      primary: '#FFFFFF', // White text for dark footer
      accent: theme.primary, // Rose accent
      footerBg: '#0D0D0D', // Specific Sokol footer bg
      footerText: '#D1D5DB', // Gray-300
    },
    typography: {
      fontFamily: (theme as any).fontHeading || 'sans-serif',
    }
  };

  return (
    <StandardFooter
      storeName={storeName}
      logo={logo}
      config={config as any}
      socialLinks={socialLinks}
      footerConfig={{
        ...footerConfig,
        description: footerConfig?.description || 'Premium quality products designed for your lifestyle.',
        showPoweredBy: true, // Enforce Ozzyl branding
        showTrustBadges: footerConfig?.showTrustBadges ?? true,
      }}
      businessInfo={businessInfo}
      categories={categories}
      planType={planType}
    />
  );
}
