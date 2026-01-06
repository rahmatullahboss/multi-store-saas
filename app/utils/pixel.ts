/**
 * Facebook Pixel Script Generator
 * 
 * Generates the Facebook Pixel base code and helper functions
 * for event tracking (PageView, AddToCart, Purchase, etc.)
 */

export interface FacebookPixelConfig {
  pixelId: string;
}

/**
 * Generate the Facebook Pixel base code script
 */
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

/**
 * Generate React-compatible pixel initialization script (for inline use)
 */
export function getPixelInitScript(pixelId: string): string {
  return `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
}

/**
 * Track AddToCart event
 */
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
  `;
}

/**
 * Track InitiateCheckout event
 */
export function getInitiateCheckoutScript(value: number, currency: string, numItems: number): string {
  return `
    if (typeof fbq !== 'undefined') {
      fbq('track', 'InitiateCheckout', {
        value: ${value},
        currency: '${currency}',
        num_items: ${numItems}
      });
    }
  `;
}

/**
 * Track Purchase event
 */
export function getPurchaseScript(value: number, currency: string, orderId: string): string {
  return `
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Purchase', {
        value: ${value},
        currency: '${currency}',
        order_id: '${orderId}'
      });
    }
  `;
}

/**
 * Track ViewContent event (product page views)
 */
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
  `;
}
