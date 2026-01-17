/**
 * Social Proof Template - Facebook/WhatsApp Style
 * 
 * Features:
 * - Facebook post-like product cards
 * - WhatsApp chat bubble testimonials
 * - Social media comment sections
 * - Reaction counts and shares
 * - Familiar, trustworthy UI
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { SocialProofSectionRenderer } from './SectionRenderer';
import { SOCIAL_PROOF_THEME } from './theme';
import { applyCustomColors } from '../_core/types';
import { StickyBuyButton } from '../_core/StickyBuyButton';

export function SocialProofTemplate({
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
  const theme = applyCustomColors(SOCIAL_PROOF_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Sections */}
      <SocialProofSectionRenderer
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

      {/* Footer - FB Style */}
      <footer className="bg-[#1C1E21] py-10">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p suppressHydrationWarning>© {new Date().getFullYear()} {storeName}</p>
          
          {planType === 'free' && (
            <div className="mt-6">
              <a 
                href="https://ozzyl.com?utm_source=social-proof-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-[#1877F2] transition-colors"
              >
                Powered by <span className="font-bold">Ozzyl</span>
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

export default SocialProofTemplate;
