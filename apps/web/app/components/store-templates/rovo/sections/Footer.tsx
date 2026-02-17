import { StandardFooter } from '~/components/store-templates/shared/StandardFooter';

interface StoreFooterProps {
  storeName: string;
  logo?: string | null;
  businessInfo?: any;
  socialLinks?: any;
  categories: (string | null)[];
  planType?: string;
  footerConfig?: any;
}

export function RovoFooter({
  storeName,
  logo,
  businessInfo,
  socialLinks,
  categories = [],
  planType = 'free',
  footerConfig,
}: StoreFooterProps) {
  // Rovo uses a light gray background
  const config = {
    colors: {
      footerBg: '#f3f4f6', // gray-100
      footerText: '#1f2937', // gray-800
      primary: '#EF4444', // red-500 (Rovo accent)
      accent: '#DC2626', // red-600
    },
    // Keep default typography or customization if Rovo has specific font
  };

  return (
    <StandardFooter
      storeName={storeName}
      logo={logo}
      // @ts-ignore StandardFooter accepts broader runtime theme config shape
      config={config}
      socialLinks={socialLinks}
      footerConfig={{
        ...footerConfig,
        description: footerConfig?.description || 'Premium quality products designed for your lifestyle.',
        showPoweredBy: footerConfig?.showPoweredBy ?? true,
        showTrustBadges: footerConfig?.showTrustBadges ?? true,
      }}
      businessInfo={businessInfo}
      categories={categories}
      planType={planType}
    />
  );
}
