/**
 * Modern Dark Template - Sleek High-Performance Design (Isolated)
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { ModernDarkSectionRenderer } from './SectionRenderer';
import { MODERN_DARK_THEME } from './theme';
import { applyCustomColors } from '../_core/types';

export function ModernDarkTemplate({
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
  const theme = applyCustomColors(MODERN_DARK_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-orange-500 selection:text-white">
      <ModernDarkSectionRenderer
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

      <footer className="bg-black py-20 border-t border-zinc-900 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-6">{storeName}</h3>
          <p className="text-zinc-500 text-lg max-w-md mx-auto mb-12">
            Pushing the boundaries of what's possible. Join the future today.
          </p>
          
          <div className="text-zinc-700 text-xs font-bold uppercase tracking-[0.3em] mb-12">
            © {new Date().getFullYear()} • {storeName} • High Performance Guaranteed
          </div>

          {planType === 'free' && (
            <div className="pt-10 border-t border-zinc-900 flex justify-center">
              <a 
                href="https://ozzyl.com?utm_source=modern-dark-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-zinc-600 hover:text-orange-500 transition-all flex items-center gap-2 grayscale hover:grayscale-0"
              >
                <span className="uppercase tracking-[0.1em]">Powered by</span>
                <span className="font-bold tracking-tight text-lg text-zinc-400">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile Sticky Footer */}
      {!isPreview && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-zinc-800 p-4 pb-safe">
          <a
            href="#order-form"
            className="block w-full bg-orange-500 text-white text-center font-black py-5 rounded-2xl uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(249,115,22,0.4)] italic"
          >
            Get it Now — {formatPrice(product.price)}
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

export default ModernDarkTemplate;
