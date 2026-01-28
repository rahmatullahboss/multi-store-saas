import { StandardFooter } from '~/components/store-templates/shared/StandardFooter';
import { AURORA_THEME } from '../theme';
import type { SocialLinks, FooterConfig } from '@db/types';

interface AuroraMinimalFooterProps {
  storeName: string;
  logo?: string | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  socialLinks?: SocialLinks | null;
  planType?: string;
  categories: (string | null)[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  themeColors?: any;
}

export function AuroraMinimalFooter({
  storeName,
  logo,
  footerConfig,
  businessInfo,
  socialLinks,
  planType = 'free',
  categories = [],
  themeColors,
}: AuroraMinimalFooterProps) {
  const theme = themeColors || AURORA_THEME;
  
  // Ensure config has colors derived from theme if not present
  const config = {
    colors: {
      primary: theme.primary,
      accent: theme.accent,
      footerBg: theme.footerBg,
      footerText: theme.footerText,
      accentGradient: theme.auroraGradient,
    },
    typography: {
      fontFamily: theme.fontHeading,
    }
  };

  return (
    <StandardFooter
      storeName={storeName}
      logo={logo}
      // @ts-expect-error - Theme config shape mismatches are handled internally
      config={config}
      socialLinks={socialLinks}
      footerConfig={{
        ...footerConfig,
        // Ensure defaults if not provided
        description: footerConfig?.description || 'Harmonizing minimalist design with soulful aesthetics.',
        showPoweredBy: footerConfig?.showPoweredBy ?? true,
        showTrustBadges: footerConfig?.showTrustBadges ?? false,
      }}
      businessInfo={businessInfo}
      categories={categories}
      planType={planType}
    />
  );
}
