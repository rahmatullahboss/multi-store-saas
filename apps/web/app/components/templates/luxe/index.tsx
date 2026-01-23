/**
 * Luxe Template - High-End Luxury Design (Isolated)
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { LuxeSectionRenderer } from './SectionRenderer';
import { LUXE_THEME } from './theme';
import { applyCustomColors } from '../_core/types';
import { StickyBuyButton } from '../_core/StickyBuyButton';

export function LuxeTemplate({
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
  const theme = applyCustomColors(LUXE_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-black text-white font-serif-display selection:bg-amber-500 selection:text-black">
      <LuxeSectionRenderer
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

      <footer className="bg-black py-20 border-t border-white/5 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-serif-display text-white tracking-widest uppercase mb-6">{storeName}</h3>
          <p className="text-zinc-600 text-sm max-w-sm mx-auto mb-12 font-sans font-light italic leading-relaxed">
            {config.orderFormText?.footerTagline || 'Reserved for those who seek the exceptional. Excellence in every detail.'}
          </p>
          
          <div className="text-zinc-800 text-[10px] uppercase tracking-[0.5em] mb-12" suppressHydrationWarning>
            {config.orderFormText?.copyrightText || `© ${new Date().getFullYear()} ${storeName} • All Rights Reserved`}
          </div>

          {planType === 'free' && (
            <div className="pt-10 border-t border-white/5 flex justify-center">
              <a 
                href="https://ozzyl.com?utm_source=luxe-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-zinc-600 hover:text-amber-500 transition-colors flex items-center gap-2 grayscale hover:grayscale-0"
              >
                <span className="uppercase tracking-[0.2em]">Powered by</span>
                <span className="font-bold tracking-tight text-sm text-zinc-400 font-sans">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile Sticky Buy Button */}
      <StickyBuyButton
        ctaText={config.ctaText || "Aquire Now"}
        price={product.price}
        formatPrice={formatPrice}
        theme={theme}
        isPreview={isPreview}
      />

      <div className="md:hidden h-24" />

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

export default LuxeTemplate;
