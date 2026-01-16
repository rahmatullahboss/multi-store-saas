/**
 * Button Connection Utilities for Custom HTML Section
 * 
 * Helps detect buttons in HTML and apply connection attributes.
 */

export interface ButtonConnection {
  selector: string;
  actionType: 'order' | 'cart' | 'whatsapp' | 'call' | 'unknown';
  productId?: number;
  phoneNumber?: string;
  messageTemplate?: string;
}

/**
 * Count buttons in HTML that have data-ozzyl-action attribute
 */
export function countConnectedButtons(html: string): number {
  if (!html) return 0;
  const matches = html.match(/data-ozzyl-action/g);
  return matches?.length || 0;
}

/**
 * Apply button connections to HTML content.
 * Adds data-ozzyl-* attributes to matching elements.
 */
export function applyButtonConnections(
  html: string, 
  connections: ButtonConnection[]
): string {
  if (!html || connections.length === 0) return html;
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const wrapper = doc.body.firstChild as Element;
    
    connections.forEach(conn => {
      // Find elements matching the selector pattern
      const elements = wrapper.querySelectorAll(
        'button, a, [role="button"], .btn, [class*="button"], ' +
        '[class*="order"], [class*="buy"], [class*="whatsapp"], [class*="call"]'
      );
      
      elements.forEach((el) => {
        const text = el.textContent?.toLowerCase().trim() || '';
        const classes = el.className?.toLowerCase() || '';
        
        // Match by action type patterns
        let shouldConnect = false;
        
        if (conn.actionType === 'order') {
          shouldConnect = text.includes('order') || text.includes('অর্ডার') || 
                         text.includes('buy') || text.includes('কিনুন') ||
                         classes.includes('order') || classes.includes('buy');
        } else if (conn.actionType === 'whatsapp') {
          shouldConnect = text.includes('whatsapp') || text.includes('হোয়াটস') ||
                         classes.includes('whatsapp');
        } else if (conn.actionType === 'call') {
          shouldConnect = text.includes('call') || text.includes('কল') ||
                         classes.includes('call');
        } else if (conn.actionType === 'cart') {
          shouldConnect = text.includes('cart') || text.includes('কার্ট') ||
                         classes.includes('cart');
        }
        
        if (shouldConnect) {
          el.setAttribute('data-ozzyl-action', conn.actionType);
          if (conn.productId) {
            el.setAttribute('data-ozzyl-product', conn.productId.toString());
          }
          if (conn.phoneNumber) {
            el.setAttribute('data-ozzyl-phone', conn.phoneNumber);
          }
          if (conn.messageTemplate) {
            el.setAttribute('data-ozzyl-message', conn.messageTemplate);
          }
        }
      });
    });
    
    return wrapper.innerHTML;
  } catch (err) {
    console.error('Failed to apply button connections:', err);
    return html;
  }
}

/**
 * Remove all connection attributes from HTML
 */
export function removeButtonConnections(html: string): string {
  if (!html) return html;
  
  return html
    .replace(/\s*data-ozzyl-action="[^"]*"/g, '')
    .replace(/\s*data-ozzyl-product="[^"]*"/g, '')
    .replace(/\s*data-ozzyl-phone="[^"]*"/g, '')
    .replace(/\s*data-ozzyl-message="[^"]*"/g, '');
}
