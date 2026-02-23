import { Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { StandardFooter } from '~/components/store-templates/shared/StandardFooter';
import { FRESHNESS_THEME } from '../theme';
import type { SocialLinks, FooterConfig } from '@db/types';

interface FreshnessFooterProps {
  storeName: string;
  logo?: string | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  socialLinks?: SocialLinks | null;
  planType?: string;
  categories: (string | null)[];
}

export function FreshnessFooter({
  storeName,
  logo,
  footerConfig,
  businessInfo,
  socialLinks,
  planType = 'free',
  categories = [],
}: FreshnessFooterProps) {
  const theme = FRESHNESS_THEME;
  // Ensure config has colors derived from theme
  const config = {
    colors: {
      primary: theme.primary,
      accent: theme.secondary,
      footerBg: theme.footerBg,
      footerText: theme.footerText,
    },
    typography: {
      fontFamily: theme.fontHeading,
    }
  };

  return (
    <div style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
      {/* Features Bar - Preserved from original Freshness design */}
      <div className="border-y" style={{ borderColor: theme.border }}>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Truck className="w-10 h-10" style={{ color: theme.secondary }} />
              <h5 className="font-bold">Fast & Free Delivery</h5>
              <p className="text-sm opacity-60">On orders over $50</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <ShieldCheck className="w-10 h-10" style={{ color: theme.secondary }} />
              <h5 className="font-bold">100% Safe Payments</h5>
              <p className="text-sm opacity-60">Secure payment gateway</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <RotateCcw className="w-10 h-10" style={{ color: theme.secondary }} />
              <h5 className="font-bold">Easy Returns</h5>
              <p className="text-sm opacity-60">30 days return policy</p>
            </div>
          </div>
        </div>
      </div>

      <StandardFooter
        storeName={storeName}
        logo={logo}
        config={config as any}
        socialLinks={socialLinks}
        footerConfig={{
          ...footerConfig,
          description: footerConfig?.description || 'Your one-stop shop for fresh, organic, and healthy groceries delivered to your doorstep.',
          showPoweredBy: footerConfig?.showPoweredBy ?? true,
          showTrustBadges: footerConfig?.showTrustBadges ?? true,
        }}
        businessInfo={businessInfo}
        categories={categories}
        planType={planType}
      />
    </div>
  );
}
