/**
 * Video Focus Template - High impact Video-First Design (Isolated)
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { VideoFocusSectionRenderer } from './SectionRenderer';
import { VIDEO_FOCUS_THEME } from './theme';
import { applyCustomColors } from '../_core/types';

export function VideoFocusTemplate({
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
  const theme = applyCustomColors(VIDEO_FOCUS_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white">
      {/* Cinematic Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5 h-20 flex items-center justify-between px-6 lg:px-12">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">
          <span className="text-red-600">V</span>
          <span className="text-white">{storeName}</span>
        </h1>
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          <a href="#hero" className="hover:text-red-500 transition-colors">Showreel</a>
          <a href="#features" className="hover:text-red-500 transition-colors">Spec</a>
          <a href="#order-form" className="hover:text-red-500 transition-colors">Access</a>
        </div>
      </nav>

      <div className="pt-20" />

      <VideoFocusSectionRenderer
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

      <footer className="bg-[#0A0A0A] py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h3 className="text-4xl font-black italic mb-8 tracking-tighter uppercase">{storeName}</h3>
          <p className="text-gray-500 text-lg max-w-sm mx-auto mb-16 font-bold leading-relaxed">
            Leading the visual revolution. Premium products for the modern creator.
          </p>
          
          <div className="text-gray-700 text-[10px] font-black uppercase tracking-[0.5em] mb-20">
            © {new Date().getFullYear()} • Global Media Store
          </div>

          {planType === 'free' && (
            <div className="pt-16 border-t border-white/5 flex flex-col items-center gap-4">
              <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Directed by</span>
              <a 
                href="https://ozzyl.com?utm_source=video-focus-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-4xl font-black tracking-tighter text-white/20 hover:text-red-600 transition-all duration-700 hover:scale-110"
              >
                Ozzyl
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile High-Impact CTA */}
      {!isPreview && (
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
          <a
            href="#order-form"
            className="block w-full bg-red-600 text-white text-center font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-[0_20px_50px_rgba(220,38,38,0.3)] border-t border-white/20 active:scale-95 transition-all"
          >
            CONFIRM ACCESS — {formatPrice(product.price)}
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

export default VideoFocusTemplate;
