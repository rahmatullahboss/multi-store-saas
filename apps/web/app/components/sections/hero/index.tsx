import type { StoreTemplateTheme } from '~/templates/store-registry';
import type { HeroBannerSettings } from '~/services/storefront-settings.schema';
import { UnifiedHero } from './UnifiedHero';

interface HeroSectionProps {
  storeName?: string;
  theme: StoreTemplateTheme;
  props: HeroBannerSettings;
  variant?: 'marketplace' | 'luxury' | 'minimal' | 'bold' | 'default';
  // Advanced overrides driven by JSON
  layout?: 'full-width' | 'contained' | 'with-sidebar';
}

export function HeroSection({
  storeName,
  theme,
  props,
  variant = 'default',
  layout
}: HeroSectionProps) {

  // Resolve layout
  const resolvedLayout = layout || (variant === 'marketplace' ? 'with-sidebar' : 'full-width');

  return (
    <UnifiedHero
      storeName={storeName}
      theme={theme}
      props={props}
      variant={variant}
      layout={resolvedLayout}
    />
  );
}
