/**
 * Showcase Template - Bold Visual Design (Isolated)
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { ShowcaseSectionRenderer } from './SectionRenderer';
import { SHOWCASE_THEME } from './theme';
import { applyCustomColors } from '../_core/types';
import { StickyBuyButton } from '../_core/StickyBuyButton';

export function ShowcaseTemplate({
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
  const theme = applyCustomColors(SHOWCASE_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-rose-500 selection:text-white">
      {/* Announcement Bar */}
      {config.urgencyText && (
        <div className="bg-rose-900/20 border-b border-rose-500/10 py-3 text-center">
          <p className="text-rose-500 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
            {config.urgencyText}
          </p>
        </div>
      )}

      <ShowcaseSectionRenderer
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

      <footer className="bg-black py-24 border-t border-white/5 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-white tracking-tighter italic mb-8">{storeName}</h3>
          
          <div className="flex flex-wrap justify-center gap-12 text-zinc-600 font-bold uppercase tracking-widest text-[10px] mb-16">
            <span className="hover:text-rose-500 transition-colors cursor-pointer">Authenticity</span>
            <span className="hover:text-rose-500 transition-colors cursor-pointer">Quality</span>
            <span className="hover:text-rose-500 transition-colors cursor-pointer">Performance</span>
          </div>
          
          <div className="text-zinc-800 text-[10px] font-black uppercase tracking-[0.5em] mb-12" suppressHydrationWarning>
            © {new Date().getFullYear()} • {storeName} • Digital Presence
          </div>

          {planType === 'free' && (
            <div className="pt-12 border-t border-white/5 flex justify-center">
              <a 
                href="https://ozzyl.com?utm_source=showcase-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-zinc-700 hover:text-rose-500 transition-all flex items-center gap-2 grayscale hover:grayscale-0"
              >
                <span className="uppercase tracking-[0.2em]">Crafted with</span>
                <span className="font-bold tracking-tight text-lg text-zinc-500">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile Sticky Buy Button */}
      <StickyBuyButton
        ctaText={config.ctaText || "Claim Yours"}
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

export default ShowcaseTemplate;
