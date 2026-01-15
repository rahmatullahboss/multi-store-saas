/**
 * Modern Premium Template - Elite High-Design (Isolated)
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { ModernPremiumSectionRenderer } from './SectionRenderer';
import { MODERN_PREMIUM_THEME } from './theme';
import { applyCustomColors } from '../_core/types';

export function ModernPremiumTemplate({
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
  const theme = applyCustomColors(MODERN_PREMIUM_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-white text-gray-950 font-sans selection:bg-black selection:text-white">
      {/* Dynamic Announcement Bar */}
      {config.urgencyText && (
        <div className="bg-black py-4 overflow-hidden whitespace-nowrap border-b border-white/10">
          <div className="animate-marquee inline-block">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-white text-[10px] font-black uppercase tracking-[0.4em] mx-10 italic">
                {config.urgencyText} • {config.urgencyText}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Elite Minimal Navbar */}
      <nav className="h-24 flex items-center justify-between px-6 lg:px-12 bg-white sticky top-0 z-50">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase underline decoration-black decoration-4 underline-offset-4">{storeName}</h1>
        <div className="hidden md:flex gap-12 text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">
          <a href="#hero" className="hover:text-black transition-colors">Elite Experience</a>
          <a href="#testmonials" className="hover:text-black transition-colors">Voices</a>
          <a href="#order-form" className="hover:text-black transition-colors">Acquire</a>
        </div>
      </nav>

      <ModernPremiumSectionRenderer
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

      <footer className="bg-black py-40">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-5xl md:text-8xl font-black text-white italic mb-12 tracking-tighter uppercase leading-none">{storeName}</h3>
          <p className="text-gray-500 text-xl max-w-lg mx-auto mb-20 font-bold leading-relaxed tracking-tight">
            Setting the global benchmark for excellence. Trusted by elites worldwide.
          </p>
          
          <div className="text-gray-800 text-[10px] font-black uppercase tracking-[0.6em] mb-24">
            © {new Date().getFullYear()} • Premium Elite Division
          </div>

          {planType === 'free' && (
            <div className="pt-20 border-t border-white/5 flex flex-col items-center gap-6">
              <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">Engineered by</span>
              <a 
                href="https://ozzyl.com?utm_source=modern-premium-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-6xl font-black tracking-tighter text-white/10 hover:text-white transition-all duration-1000"
              >
                Ozzyl
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile Sticky Action */}
      {!isPreview && (
        <div className="md:hidden fixed bottom-8 left-6 right-6 z-50">
          <a
            href="#order-form"
            className="block w-full bg-black text-white text-center font-black py-7 rounded-3xl uppercase tracking-[0.2em] text-xs shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-t border-white/20 active:scale-95 transition-all italic"
          >
            ORDER ELITE — {formatPrice(product.price)}
          </a>
        </div>
      )}

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

export default ModernPremiumTemplate;
