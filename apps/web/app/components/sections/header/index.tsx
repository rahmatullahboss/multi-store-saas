import type { ThemeConfig, SocialLinks } from '@db/types';
import type { StoreCategory, StoreTemplateTheme } from '~/templates/store-registry';
import { UnifiedHeader } from './UnifiedHeader';

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
  props?: {
    layout?: 'logo-left' | 'logo-center';
    showTopBar?: boolean;
    isSticky?: boolean;
    enableBlur?: boolean;
  }
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
  props = {},
}: HeaderSectionProps) {
  
  // Resolve properties based on variant if not explicitly provided
  const resolvedLayout = props.layout || (variant === 'luxury' || variant === 'minimal' ? 'logo-center' : 'logo-left');
  const resolvedShowTopBar = props.showTopBar ?? (variant === 'marketplace');
  const resolvedSticky = props.isSticky ?? true;
  const resolvedBlur = props.enableBlur ?? (variant === 'luxury');

  return (
    <UnifiedHeader
      storeName={storeName}
      logo={logo}
      isPreview={isPreview}
      config={config}
      categories={categories}
      currentCategory={currentCategory}
      socialLinks={socialLinks}
      theme={theme}
      variant={variant}
      layout={resolvedLayout}
      showTopBar={resolvedShowTopBar}
      isSticky={resolvedSticky}
      enableBlur={resolvedBlur}
    />
  );
}
