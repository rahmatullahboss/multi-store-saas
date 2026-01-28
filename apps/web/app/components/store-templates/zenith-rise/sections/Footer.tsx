import { StandardFooter } from '~/components/store-templates/shared/StandardFooter';
import { ZENITH_RISE_THEME } from '~/components/store-templates/zenith-rise/styles/tokens';
import type { SocialLinks, FooterConfig } from '@db/types';

interface ZenithRiseFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories?: (string | null)[];
  planType?: string;
}

export function ZenithRiseFooter({
  storeName,
  logo,
  socialLinks,
  footerConfig,
  businessInfo,
  categories = [],
  planType = 'free',
}: ZenithRiseFooterProps) {
  
  // Zenith Rise has a dark theme
  const config = {
    colors: {
      footerBg: ZENITH_RISE_THEME.secondary,
      footerText: (ZENITH_RISE_THEME as any).muted || '#9CA3AF',
      primary: '#6366f1', // Indigo 500
      accent: ZENITH_RISE_THEME.accent,
    },
    typography: {
      fontFamily: ZENITH_RISE_THEME.fontFamily,
    }
  };

  return (
    <StandardFooter
      storeName={storeName}
      logo={logo}
      // @ts-expect-error - Theme config type mismatch is expected here during migration
      config={config}
      socialLinks={socialLinks}
      footerConfig={{
        ...footerConfig,
        description: footerConfig?.description || 'Elevating your lifestyle with premium products designed for the modern world.',
        showPoweredBy: footerConfig?.showPoweredBy ?? true,
        showTrustBadges: footerConfig?.showTrustBadges ?? true,
      }}
      businessInfo={businessInfo}
      categories={categories}
      planType={planType}
    />
  );
}
