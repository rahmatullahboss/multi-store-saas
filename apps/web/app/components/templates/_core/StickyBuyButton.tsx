/**
 * Sticky Buy Button - Mobile sticky footer for all templates
 * 
 * Shared component to ensure consistent purchase behavior and high conversion.
 * Features:
 * - Fixed position at bottom on mobile only
 * - Dynamic theme support via ThemeConfig
 * - Price and CTA text display
 * - Backdrop blur and safe area padding
 */

import type { ThemeConfig } from './types';

interface StickyBuyButtonProps {
  ctaText: string;
  price: number;
  formatPrice: (price: number) => string;
  theme: ThemeConfig;
  isPreview?: boolean;
}

export function StickyBuyButton({
  ctaText,
  price,
  formatPrice,
  theme,
  isPreview = false,
}: StickyBuyButtonProps) {
  if (isPreview) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe bg-white/80 backdrop-blur-md border-t border-gray-100">
      <a
        href="#order-form"
        style={{
          backgroundColor: theme.primary,
          color: theme.isDark ? '#fff' : '#fff', // Most primary buttons are dark bg with white text
        }}
        className="block w-full text-center font-black py-4 rounded-2xl uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95"
      >
        {ctaText} — {formatPrice(price)}
      </a>
    </div>
  );
}

export default StickyBuyButton;
