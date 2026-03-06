import type { ThemeConfig, SocialLinks } from '@db/types';
import type { StoreCategory, StoreTemplateTheme } from '~/templates/store-registry';
import { HeaderMarketplace } from './HeaderMarketplace';

interface HeaderSectionProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  categories: (string | StoreCategory | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
  theme: StoreTemplateTheme;
  variant?: 'default' | 'minimal' | 'bold' | 'marketplace' | 'luxury';
}

export function HeaderSection({
  storeName,
  logo,
  isPreview = false,
  config,
  categories = [],
  currentCategory,
  socialLinks,
  theme,
  variant = 'default',
}: HeaderSectionProps) {
  if (variant === 'marketplace') {
    return (
      <HeaderMarketplace
        storeName={storeName}
        logo={logo}
        isPreview={isPreview}
        config={config}
        categories={categories}
        currentCategory={currentCategory}
        socialLinks={socialLinks}
        theme={theme}
      />
    );
  }

  // Fallback default header (simplified for now)
  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: theme.headerBg || '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
         <div className="font-bold text-xl" style={{ color: theme.text }}>{storeName}</div>
      </div>
    </header>
  );
}
