/**
 * Facebook Pixel Script Component
 * 
 * Injects Facebook Pixel tracking code into the page head.
 * Use this in storefront layouts to enable tracking.
 * 
 * Supports dual-pixel mode:
 * - Merchant pixel: For individual store tracking
 * - Master pixel: For platform-wide audience aggregation
 */

interface FacebookPixelProps {
  pixelId: string | null | undefined;
  masterPixelId?: string | null;
}

export function FacebookPixelScript({ pixelId, masterPixelId }: FacebookPixelProps) {
  // At least one pixel must be present
  if (!pixelId && !masterPixelId) return null;

  // Build pixel initialization code
  const pixelInitCode = [
    pixelId ? `fbq('init', '${pixelId}');` : '',
    masterPixelId ? `fbq('init', '${masterPixelId}');` : '',
  ].filter(Boolean).join('\n            ');

  return (
    <>
      {/* Facebook Pixel Base Code */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            ${pixelInitCode}
            fbq('track', 'PageView');
          `,
        }}
      />
      {/* Noscript fallback - use primary pixel (merchant or master) */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId || masterPixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}


/**
 * Track custom Facebook Pixel events
 * Call these functions from your components to track specific actions
 */
export const fbPixelEvents = {
  // Track when user views a product
  viewContent: (productId: string, productName: string, value: number, currency = 'BDT') => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_ids: [productId],
        content_name: productName,
        content_type: 'product',
        value,
        currency,
      });
    }
  },

  // Track add to cart
  addToCart: (productId: string, productName: string, value: number, currency = 'BDT') => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        content_ids: [productId],
        content_name: productName,
        content_type: 'product',
        value,
        currency,
      });
    }
  },

  // Track checkout initiation
  initiateCheckout: (value: number, currency = 'BDT', numItems = 1) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        value,
        currency,
        num_items: numItems,
      });
    }
  },

  // Track successful purchase
  purchase: (value: number, currency = 'BDT', contentIds: string[] = []) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        value,
        currency,
        content_ids: contentIds,
        content_type: 'product',
      });
    }
  },

  // Track lead generation (form submission)
  lead: (value = 0, currency = 'BDT') => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        value,
        currency,
      });
    }
  },

  // Custom event tracking
  trackCustom: (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', eventName, params);
    }
  },
};
