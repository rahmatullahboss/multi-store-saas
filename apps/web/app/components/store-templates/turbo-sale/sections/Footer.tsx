import { Shield, Truck, RotateCcw } from 'lucide-react';
import { TURBO_SALE_THEME } from '../styles/tokens';
import { StandardFooter } from '~/components/store-templates/shared/StandardFooter';
import type { SocialLinks, FooterConfig } from '@db/types';

interface TurboSaleFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | null)[];
  planType?: string;
}

export function TurboSaleFooter({
  storeName,
  logo,
  socialLinks,
  footerConfig,
  businessInfo,
  categories,
  planType = 'free',
}: TurboSaleFooterProps) {
  const { primary, footerBg, accent } = TURBO_SALE_THEME;
  const footerText = '#FFFFFF';
  
  const config = {
    colors: {
      footerBg: footerBg,
      footerText: footerText,
      primary: primary,
      accent: accent,
    },
    // Keep default or custom if needed
  };

  return (
    <footer style={{ backgroundColor: footerBg, borderColor: primary }} className="border-t-4">
      {/* Trust Badges Bar - Preserved from original Turbo Sale design */}
      <div className="border-b" style={{ borderColor: `${primary}20` }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <Truck className="h-5 w-5" style={{ color: accent }} />
              <span className="text-xs font-medium" style={{ color: footerText }}>
                ফ্রি ডেলিভারি
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Shield className="h-5 w-5" style={{ color: accent }} />
              <span className="text-xs font-medium" style={{ color: footerText }}>
                ১০০% অরিজিনাল
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="h-5 w-5" style={{ color: accent }} />
              <span className="text-xs font-medium" style={{ color: footerText }}>
                ৭ দিন রিটার্ন
              </span>
            </div>
          </div>
        </div>
      </div>

      <StandardFooter
        storeName={storeName}
        logo={logo}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config={config as any}
        socialLinks={socialLinks}
        footerConfig={{
          ...footerConfig,
          description: footerConfig?.description || 'সেরা মানের পণ্য, সেরা দামে! সীমিত সময়ের অফার।',
          showPoweredBy: footerConfig?.showPoweredBy ?? true,
          showTrustBadges: footerConfig?.showTrustBadges ?? true,
        }}
        businessInfo={businessInfo}
        categories={categories}
        planType={planType}
      />
    </footer>
  );
}

export default TurboSaleFooter;
