/**
 * Mobile First Template - Fast Mobile-Centric Design (Isolated)
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { MobileFirstSectionRenderer } from './SectionRenderer';
import { MOBILE_FIRST_THEME } from './theme';
import { applyCustomColors } from '../_core/types';
import { StickyBuyButton } from '../_core/StickyBuyButton';

export function MobileFirstTemplate({
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
  const theme = applyCustomColors(MOBILE_FIRST_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-white text-gray-950 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Mobile-Friendly Slim Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100 h-14 flex items-center justify-between px-4">
        <h1 className="text-xl font-black text-indigo-600 tracking-tight">{storeName}</h1>
        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
      </nav>

      <div className="pt-14" />

      <MobileFirstSectionRenderer
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

      <footer className="bg-gray-100 py-16 text-center px-4">
        <h3 className="text-2xl font-black text-indigo-600 mb-4">{storeName}</h3>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-10 opacity-60">
          © {new Date().getFullYear()} • Mobile Optimized Store
        </p>

        {planType === 'free' && (
          <div className="pt-8 border-t border-gray-200 flex flex-col items-center gap-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Built For Success With</span>
            <a 
              href="https://ozzyl.com?utm_source=mobile-first-branding&utm_medium=referral" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-2xl font-black tracking-tighter text-indigo-600 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100"
            >
              Ozzyl
            </a>
          </div>
        )}
      </footer>

      {/* Mobile Sticky Buy Button */}
      <StickyBuyButton
        ctaText={config.ctaText || "Buy Now"}
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

export default MobileFirstTemplate;
