/**
 * NovaLux Premium Store Template
 *
 * World-class luxury ecommerce template inspired by Shopify Prestige,
 * Squarespace Fulton, and 2024 design trends.
 *
 * DUAL MODE ARCHITECTURE:
 * 1. PREVIEW MODE (isPreview=true): Self-contained state-based routing
 * 2. LIVE MODE (isPreview=false): Real Remix routes
 */

import type { StoreTemplateProps } from '~/templates/store-registry';
import { PreviewNovaLuxStore } from './preview';
import { LiveNovaLuxHomepage } from './LiveHomepage';

export { NovaLuxProductCard } from './LiveHomepage';

export function NovaLuxTemplate(props: StoreTemplateProps) {
  if (props.isPreview) {
    return <PreviewNovaLuxStore {...props} />;
  }
  return <LiveNovaLuxHomepage {...props} />;
}

export default NovaLuxTemplate;
