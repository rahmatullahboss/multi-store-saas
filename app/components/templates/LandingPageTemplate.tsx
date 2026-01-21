/**
 * Landing Page Template Dispatcher
 * 
 * This component acts as a high-level wrapper and dispatcher for all isolated landing page templates.
 * it selects the appropriate template component based on the configuration and handles
 * global overlays like custom HTML sections.
 * 
 * Quick Builder v2: Added CheckoutModal support for embedded checkout
 */

import { useState, useCallback } from 'react';
import { getTemplateComponent } from '~/templates/registry';
import type { TemplateProps } from '~/templates/registry';
import { CustomSectionRenderer } from './CustomSectionRenderer';
import { CheckoutModal } from '~/components/checkout/CheckoutModal';

// Extended props with checkout modal support
interface LandingPageTemplateProps extends TemplateProps {
  checkoutModalEnabled?: boolean;
  whatsappNumber?: string;
  whatsappEnabled?: boolean;
  onOrderSuccess?: (orderId: string) => void;
}

export function LandingPageTemplate(props: LandingPageTemplateProps) {
  const { 
    config, 
    customSections = [],
    checkoutModalEnabled = false,
    whatsappNumber,
    whatsappEnabled,
    onOrderSuccess,
  } = props;
  
  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Build product from config for checkout
  const checkoutProduct = {
    id: props.product?.id || 0,
    name: props.product?.title || config.productName || 'Product',
    price: props.product?.price || config.productPrice || 0,
    compareAtPrice: props.product?.compareAtPrice || config.productCompareAtPrice,
    image: props.product?.imageUrl || config.heroImage,
    variants: config.productVariants || [],
  };

  // Handler to open checkout modal (passed to template components)
  const handleOpenCheckout = useCallback(() => {
    if (checkoutModalEnabled) {
      setIsCheckoutOpen(true);
    }
  }, [checkoutModalEnabled]);

  // Handler for order success
  const handleOrderSuccess = useCallback((orderId: string) => {
    onOrderSuccess?.(orderId);
    // Keep modal open to show success state
  }, [onOrderSuccess]);
  
  // Safely get the component for the selected template
  let TemplateComponent;
  try {
    TemplateComponent = getTemplateComponent(config.templateId);
  } catch (error) {
    // Fallback if template component could not be found
    console.error(`Template component for ID "${config.templateId}" not found.`, error);
    return (
      <div className="p-20 text-center bg-red-50 text-red-900 border-4 border-dashed border-red-200 rounded-3xl">
        <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">Engine Error</h2>
        <p className="font-bold">Template composition failed. Please check your configuration ID: <span className="underline italic">{config.templateId}</span></p>
      </div>
    );
  }

  // Enhanced props with checkout handler
  const enhancedProps = {
    ...props,
    onCtaClick: checkoutModalEnabled ? handleOpenCheckout : undefined,
  };

  return (
    <>
      {/* Custom HTML Sections - Rendered before the main content */}
      <CustomSectionRenderer customSections={customSections} position="before-hero" />
      
      {/* The actual isolated template component */}
      <TemplateComponent {...enhancedProps} />
      
      {/* Custom HTML Sections - Rendered before the footer */}
      <CustomSectionRenderer customSections={customSections} position="before-footer" />

      {/* Checkout Modal (Quick Builder v2) */}
      {checkoutModalEnabled && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          product={checkoutProduct}
          storeId={props.store?.id || 0}
          storeName={props.store?.name}
          shippingOptions={config.shippingConfig ? [
            { id: 'dhaka', name: 'ঢাকার ভিতরে', fee: config.shippingConfig.insideDhaka || 60 },
            { id: 'outside', name: 'ঢাকার বাইরে', fee: config.shippingConfig.outsideDhaka || 120 },
          ] : undefined}
          whatsappNumber={whatsappNumber || config.whatsappNumber}
          whatsappEnabled={whatsappEnabled || config.whatsappEnabled}
          onSuccess={handleOrderSuccess}
        />
      )}
    </>
  );
}

export default LandingPageTemplate;
