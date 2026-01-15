/**
 * Organic Template - Fresh Eco-Friendly Design (Isolated)
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { OrganicSectionRenderer } from './SectionRenderer';
import { ORGANIC_THEME } from './theme';
import { applyCustomColors } from '../_core/types';
import { StickyBuyButton } from '../_core/StickyBuyButton';

export function OrganicTemplate({
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
  const theme = applyCustomColors(ORGANIC_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-green-600 selection:text-white">
      <OrganicSectionRenderer
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

      <footer className="bg-green-900 py-24 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-white mb-6 tracking-tight italic">{storeName}</h3>
          <p className="text-green-200 text-lg max-w-sm mx-auto mb-12 font-medium">
            Rooted in nature. Committed to your well-being and a sustainable future.
          </p>
          
          <div className="text-green-400 text-xs font-bold uppercase tracking-[0.2em] mb-12 opacity-50">
            © {new Date().getFullYear()} • {storeName} • Purely Organic
          </div>

          {planType === 'free' && (
            <div className="pt-12 border-t border-green-800 flex justify-center">
              <a 
                href="https://ozzyl.com?utm_source=organic-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-green-500 hover:text-white transition-all flex items-center gap-2 grayscale hover:grayscale-0"
              >
                <span className="uppercase tracking-[0.1em]">Grown with</span>
                <span className="font-bold tracking-tight text-xl text-green-300">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile Sticky Buy Button */}
      <StickyBuyButton
        ctaText={config.ctaText || "Organic Order"}
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

export default OrganicTemplate;
