/**
 * Luxe Boutique Store Template
 *
 * Elegant design for fashion, jewelry & luxury goods.
 * Features: Black + Gold accents, serif typography, refined animations.
 *
 * DUAL MODE ARCHITECTURE:
 * 1. PREVIEW MODE (isPreview=true): Self-contained state-based routing
 * 2. LIVE MODE (isPreview=false): Real Remix routes
 */

import type { StoreTemplateProps } from '~/templates/store-registry';
import { PreviewLuxeStore } from './preview';
import { LiveLuxeBoutiqueHomepage } from './LiveHomepage';

export function LuxeBoutiqueTemplate(props: StoreTemplateProps) {
  if (props.isPreview) {
    return <PreviewLuxeStore {...props} />;
  }
  return <LiveLuxeBoutiqueHomepage {...props} />;
}

export default LuxeBoutiqueTemplate;
