/**
 * Urgency-Scarcity Template - FOMO Focused Design
 * 
 * Features:
 * - Multiple countdown timers
 * - Stock warning bars
 * - Blinking urgency elements
 * - "X people viewing" notifications
 * - Dark dramatic background
 * - Red/Yellow high-alert colors
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { UrgencyScarcitySectionRenderer } from './SectionRenderer';
import { URGENCY_SCARCITY_THEME } from './theme';
import { applyCustomColors } from '../_core/types';
import { StickyBuyButton } from '../_core/StickyBuyButton';
import { AlertTriangle, Flame } from 'lucide-react';

export function UrgencyScarcityTemplate({
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
  const theme = applyCustomColors(URGENCY_SCARCITY_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Flashing Urgency Banner */}
      <div className={`${isPreview ? 'sticky' : 'fixed'} top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 py-2`}>
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-2 text-white text-sm font-bold">
          <Flame className="w-4 h-4 animate-pulse" />
          <span>⚡ সীমিত সময়ের অফার - এখনই অর্ডার করুন! ⚡</span>
          <Flame className="w-4 h-4 animate-pulse" />
        </div>
      </div>

      {/* Spacer for fixed banner */}
      {!isPreview && <div className="h-10" />}

      {/* Sections */}
      <UrgencyScarcitySectionRenderer
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

      {/* Footer - Dark */}
      <footer className="bg-black py-10 border-t border-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p suppressHydrationWarning>© {new Date().getFullYear()} {storeName}</p>
          
          {planType === 'free' && (
            <div className="mt-6">
              <a 
                href="https://ozzyl.com?utm_source=urgency-scarcity-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-700 hover:text-yellow-500 transition-colors"
              >
                Powered by <span className="font-bold">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile Sticky Buy Button */}
      <StickyBuyButton
        ctaText={config.ctaText || "এখনই অর্ডার করুন!"}
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

export default UrgencyScarcityTemplate;
