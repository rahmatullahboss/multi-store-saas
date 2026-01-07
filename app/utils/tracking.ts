/**
 * Unified Tracking Script Generator
 * 
 * Generates Facebook Pixel and Google Analytics 4 (GA4) tracking scripts.
 * All ecommerce events supported: PageView, ViewContent, AddToCart, 
 * InitiateCheckout, Purchase, Lead.
 * 
 * IMPORTANT: Each store has its own pixel IDs stored in the stores table.
 * This ensures complete data isolation between tenants.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface TrackingConfig {
  facebookPixelId?: string | null;
  googleAnalyticsId?: string | null;
}

export interface ProductTrackingData {
  id: string;
  name: string;
  price: number;
  currency?: string;
  category?: string;
  variant?: string;
  quantity?: number;
}

export interface OrderTrackingData {
  orderId: string;
  value: number;
  currency?: string;
  items: ProductTrackingData[];
  shipping?: number;
  tax?: number;
}

// ============================================================================
// FACEBOOK PIXEL SCRIPTS
// ============================================================================

/**
 * Generate Facebook Pixel initialization script (for head injection)
 */
export function getFacebookPixelInitScript(pixelId: string): string {
  return `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
}

/**
 * Get noscript fallback for Facebook Pixel
 */
export function getFacebookPixelNoscript(pixelId: string): string {
  return `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
}

// ============================================================================
// GOOGLE ANALYTICS 4 (GA4) SCRIPTS
// ============================================================================

/**
 * Generate GA4 gtag.js initialization script (for head injection)
 */
export function getGA4InitScript(measurementId: string): string {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      send_page_view: true
    });
  `;
}

/**
 * Get GA4 gtag.js library URL
 */
export function getGA4ScriptUrl(measurementId: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
}

// ============================================================================
// CLIENT-SIDE TRACKING EVENTS
// ============================================================================

/**
 * Tracking events object for client-side use
 * Call these from React components to fire events to both FB + GA4
 */
export const trackingEvents = {
  /**
   * Track product view (ViewContent / view_item)
   */
  viewContent: (product: ProductTrackingData) => {
    const currency = product.currency || 'BDT';
    
    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        content_category: product.category || '',
        value: product.price,
        currency,
      });
    }
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'view_item', {
        currency,
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category || '',
          item_variant: product.variant || '',
          price: product.price,
          quantity: 1,
        }],
      });
    }
  },

  /**
   * Track add to cart (AddToCart / add_to_cart)
   */
  addToCart: (product: ProductTrackingData) => {
    const currency = product.currency || 'BDT';
    const quantity = product.quantity || 1;
    
    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price * quantity,
        currency,
      });
    }
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'add_to_cart', {
        currency,
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category || '',
          item_variant: product.variant || '',
          price: product.price,
          quantity,
        }],
      });
    }
  },

  /**
   * Track checkout initiation (InitiateCheckout / begin_checkout)
   */
  initiateCheckout: (value: number, numItems: number, currency = 'BDT') => {
    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        value,
        currency,
        num_items: numItems,
      });
    }
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'begin_checkout', {
        currency,
        value,
      });
    }
  },

  /**
   * Track purchase (Purchase / purchase)
   */
  purchase: (order: OrderTrackingData) => {
    const currency = order.currency || 'BDT';
    
    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        value: order.value,
        currency,
        content_ids: order.items.map(i => i.id),
        content_type: 'product',
        num_items: order.items.reduce((sum, i) => sum + (i.quantity || 1), 0),
      });
    }
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: order.orderId,
        value: order.value,
        currency,
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        items: order.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category || '',
          item_variant: item.variant || '',
          price: item.price,
          quantity: item.quantity || 1,
        })),
      });
    }
  },

  /**
   * Track lead generation (Lead / generate_lead)
   */
  lead: (value = 0, currency = 'BDT') => {
    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        value,
        currency,
      });
    }
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'generate_lead', {
        value,
        currency,
      });
    }
  },

  /**
   * Track custom event
   */
  custom: (eventName: string, params?: Record<string, any>) => {
    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', eventName, params);
    }
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params);
    }
  },
};

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

// Keep old function names for existing code
export const getPixelInitScript = getFacebookPixelInitScript;

export function getAddToCartScript(value: number, currency: string, productId: string, productName: string): string {
  return `
    if (typeof fbq !== 'undefined') {
      fbq('track', 'AddToCart', {
        value: ${value},
        currency: '${currency}',
        content_ids: ['${productId}'],
        content_name: '${productName}',
        content_type: 'product'
      });
    }
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_to_cart', {
        currency: '${currency}',
        value: ${value},
        items: [{ item_id: '${productId}', item_name: '${productName}', price: ${value}, quantity: 1 }]
      });
    }
  `;
}

export function getInitiateCheckoutScript(value: number, currency: string, numItems: number): string {
  return `
    if (typeof fbq !== 'undefined') {
      fbq('track', 'InitiateCheckout', {
        value: ${value},
        currency: '${currency}',
        num_items: ${numItems}
      });
    }
    if (typeof gtag !== 'undefined') {
      gtag('event', 'begin_checkout', {
        currency: '${currency}',
        value: ${value}
      });
    }
  `;
}

export function getPurchaseScript(value: number, currency: string, orderId: string): string {
  return `
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Purchase', {
        value: ${value},
        currency: '${currency}',
        order_id: '${orderId}'
      });
    }
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: '${orderId}',
        value: ${value},
        currency: '${currency}'
      });
    }
  `;
}

export function getViewContentScript(value: number, currency: string, productId: string, productName: string): string {
  return `
    if (typeof fbq !== 'undefined') {
      fbq('track', 'ViewContent', {
        value: ${value},
        currency: '${currency}',
        content_ids: ['${productId}'],
        content_name: '${productName}',
        content_type: 'product'
      });
    }
    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_item', {
        currency: '${currency}',
        value: ${value},
        items: [{ item_id: '${productId}', item_name: '${productName}', price: ${value}, quantity: 1 }]
      });
    }
  `;
}

// Re-export old pixel.ts function (deprecated but kept for compatibility)
export function generatePixelScript(pixelId: string): string {
  return `
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->
  `.trim();
}
