/**
 * Minimal Clean Template - Apple-like Simplicity
 * 
 * Features:
 * - Ultra minimal design
 * - Massive typography
 * - Lots of whitespace
 * - Black/White with blue accent
 * - Single focused CTA
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { MinimalCleanSectionRenderer } from './SectionRenderer';
import { MINIMAL_CLEAN_THEME } from './theme';
import { applyCustomColors } from '../_core/types';
import { StickyBuyButton } from '../_core/StickyBuyButton';

export function MinimalCleanTemplate({
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
  const theme = applyCustomColors(MINIMAL_CLEAN_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-white">
      {/* Sections */}
      <MinimalCleanSectionRenderer
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

      {/* Footer - Minimal */}
      <footer className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm" suppressHydrationWarning>
            © {new Date().getFullYear()} {storeName}
          </p>
          
          {planType === 'free' && (
            <div className="mt-8">
              <a 
                href="https://ozzyl.com?utm_source=minimal-clean-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Powered by <span className="font-bold">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile Sticky Buy Button */}
      <StickyBuyButton
        ctaText={config.ctaText || "Order"}
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

export default MinimalCleanTemplate;
