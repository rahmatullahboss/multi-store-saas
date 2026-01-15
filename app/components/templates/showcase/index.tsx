/**
 * Showcase Template - Bold Visual Design (Isolated)
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { ShowcaseSectionRenderer } from './SectionRenderer';
import { SHOWCASE_THEME } from './theme';
import { applyCustomColors } from '../_core/types';

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
          
          <div className="text-zinc-800 text-[10px] font-black uppercase tracking-[0.5em] mb-12">
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

      {/* Mobile Sticky Footer */}
      {!isPreview && (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
          <a
            href="#order-form"
            className="block w-full bg-rose-600 text-white text-center font-bold py-5 rounded-2xl uppercase tracking-[0.15em] text-xs shadow-[0_20px_40px_rgba(244,63,94,0.4)] italic backdrop-blur-md border border-rose-500/20"
          >
            Claim Yours — {formatPrice(product.price)}
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

export default ShowcaseTemplate;
