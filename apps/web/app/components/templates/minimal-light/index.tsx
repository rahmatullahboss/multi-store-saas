/**
 * Minimal Light Template - Elegant & Understated (Isolated)
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { MinimalLightSectionRenderer } from './SectionRenderer';
import { MINIMAL_LIGHT_THEME } from './theme';
import { applyCustomColors } from '../_core/types';
import { StickyBuyButton } from '../_core/StickyBuyButton';

export function MinimalLightTemplate({
  storeName,
  storeId,
  product,
  config,
  currency,
  isPreview = false,
  planType = 'free',
  productVariants = [],
  orderBumps = [],
}: TemplateProps) {
  const formatPrice = useFormatPrice();
  const theme = applyCustomColors(MINIMAL_LIGHT_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-white text-gray-950 font-sans selection:bg-gray-950 selection:text-white">
      {/* Super Minimal Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-3xl h-16 flex items-center justify-between px-8 border-b border-gray-50">
        <span className="text-xs font-black uppercase tracking-[0.5em]">{storeName}</span>
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest hidden md:flex">
          <a href="#hero" className="hover:text-gray-400 transition-colors">Intro</a>
          <a href="#gallery" className="hover:text-gray-400 transition-colors">Curated</a>
          <a href="#order-form" className="hover:text-gray-400 transition-colors">Acquire</a>
        </div>
      </nav>

      <div className="pt-16" />

      <MinimalLightSectionRenderer
        sectionOrder={config.sectionOrder}
        hiddenSections={config.hiddenSections}
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
      />

      <footer className="bg-white py-24 text-center border-t border-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-xs font-black uppercase tracking-[1em] mb-12">{storeName}</h3>
          
          <div className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.4em] mb-16" suppressHydrationWarning>
            © {new Date().getFullYear()} • Curated Edition
          </div>

          {planType === 'free' && (
            <div className="pt-12 border-t border-gray-50 flex justify-center">
              <a 
                href="https://ozzyl.com?utm_source=minimal-light-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-gray-400 hover:text-gray-950 transition-all flex items-center gap-3 grayscale hover:grayscale-0 opacity-40 hover:opacity-100"
              >
                <span className="uppercase tracking-[0.3em]">Built with</span>
                <span className="font-bold tracking-tight text-xl text-gray-900">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile Sticky Buy Button */}
      <StickyBuyButton
        ctaText={config.ctaText || "ORDER NOW"}
        price={product.price}
        formatPrice={formatPrice}
        theme={theme}
        isPreview={isPreview}
      />

      <div className="md:hidden h-28" />

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

export default MinimalLightTemplate;
