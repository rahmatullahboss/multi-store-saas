/**
 * Story-Driven Template - Emotional Problem→Solution Narrative
 * 
 * Features:
 * - Long-form storytelling layout
 * - Personal connection focus
 * - Warm, inviting colors (amber/orange)
 * - Handwritten-style accents
 * - Emotional journey narrative
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { StoryDrivenSectionRenderer } from './SectionRenderer';
import { STORY_DRIVEN_THEME } from './theme';
import { applyCustomColors } from '../_core/types';
import { StickyBuyButton } from '../_core/StickyBuyButton';

export function StoryDrivenTemplate({
  storeName,
  storeId,
  product,
  config,
  currency,
  isPreview = false,
  planType = 'free',
  productVariants = [],
  orderBumps = [],
  selectedSection,
  landingPageId,
}: TemplateProps) {
  const formatPrice = useFormatPrice();
  const theme = applyCustomColors(STORY_DRIVEN_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Sections */}
      <StoryDrivenSectionRenderer
        sectionOrder={config.sectionOrder}
        hiddenSections={config.hiddenSections}
        selectedSection={selectedSection}
        config={config}
        product={product}
        storeName={storeName}
        theme={theme}
        formatPrice={formatPrice}
        productVariants={productVariants}
        orderBumps={orderBumps}
        currency={currency}
        storeId={storeId}
        isPreview={isPreview}
        planType={planType}
        landingPageId={landingPageId}
      />

      {/* Footer */}
      <footer className="bg-amber-900 py-10">
        <div className="max-w-4xl mx-auto px-4 text-center text-amber-200 text-sm">
          <p suppressHydrationWarning>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          
          {planType === 'free' && (
            <div className="mt-8 pt-6 border-t border-amber-800 flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=story-driven-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-amber-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile Sticky Buy Button */}
      <StickyBuyButton
        ctaText={config.ctaText || "অর্ডার করুন"}
        price={product.price}
        formatPrice={formatPrice}
        theme={theme}
        isPreview={isPreview}
      />

      <div className="md:hidden h-20" />

      {/* Floating Buttons */}
      <FloatingButtons
        whatsappEnabled={config.whatsappEnabled}
        whatsappNumber={config.whatsappNumber}
        whatsappMessage={config.whatsappMessage}
        callEnabled={config.callEnabled}
        callNumber={config.callNumber}
        productTitle={product.title}
      />
    </div>
  );
}

export default StoryDrivenTemplate;
