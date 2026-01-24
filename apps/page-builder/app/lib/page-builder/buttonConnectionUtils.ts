/**
 * Button Connection Utilities for Custom HTML Section
 * 
 * Helps detect buttons in HTML and apply connection attributes.
 * IMPORTANT: Preserves full HTML document structure (doctype, html, body)
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
 * Apply button connections to HTML content using regex.
 * PRESERVES full HTML document structure (doctype, html, body, styles).
 * Adds data-ozzyl-* attributes to matching button/link elements.
 */
export function applyButtonConnections(
  html: string, 
  connections: ButtonConnection[]
): string {
  if (!html || connections.length === 0) return html;
  
  let result = html;
  
  connections.forEach(conn => {
    if (conn.actionType === 'unknown') return;
    
    // Build patterns for different button types
    const patterns = getButtonPatterns(conn.actionType);
    
    patterns.forEach(pattern => {
      // Match button/link tags containing the pattern
      const tagRegex = new RegExp(
        `(<(?:button|a)[^>]*>)([^<]*(?:${pattern})[^<]*)(</(?:button|a)>)`,
        'gi'
      );
      
      result = result.replace(tagRegex, (match, openTag, content, closeTag) => {
        // Skip if already connected
        if (openTag.includes('data-ozzyl-action')) {
          return match;
        }
        
        // Build attributes string
        let attrs = ` data-ozzyl-action="${conn.actionType}"`;
        if (conn.productId) {
          attrs += ` data-ozzyl-product="${conn.productId}"`;
        }
        if (conn.phoneNumber) {
          attrs += ` data-ozzyl-phone="${conn.phoneNumber}"`;
        }
        if (conn.messageTemplate) {
          attrs += ` data-ozzyl-message="${conn.messageTemplate}"`;
        }
        
        // Insert attributes before the closing >
        const newOpenTag = openTag.replace(/>$/, `${attrs}>`);
        return `${newOpenTag}${content}${closeTag}`;
      });
      
      // Also match by class names in the tag itself
      const classRegex = new RegExp(
        `(<(?:button|a|div|span)[^>]*class="[^"]*(?:${pattern})[^"]*"[^>]*)>`,
        'gi'
      );
      
      result = result.replace(classRegex, (match, beforeClose) => {
        if (match.includes('data-ozzyl-action')) {
          return match;
        }
        
        let attrs = ` data-ozzyl-action="${conn.actionType}"`;
        if (conn.productId) {
          attrs += ` data-ozzyl-product="${conn.productId}"`;
        }
        if (conn.phoneNumber) {
          attrs += ` data-ozzyl-phone="${conn.phoneNumber}"`;
        }
        if (conn.messageTemplate) {
          attrs += ` data-ozzyl-message="${conn.messageTemplate}"`;
        }
        
        return `${beforeClose}${attrs}>`;
      });
    });
  });
  
  return result;
}

/**
 * Get regex patterns for detecting buttons by action type
 */
function getButtonPatterns(actionType: string): string[] {
  switch (actionType) {
    case 'order':
      return ['order', 'অর্ডার', 'buy', 'কিনুন', 'এখনই', 'কনফার্ম'];
    case 'cart':
      return ['cart', 'কার্ট', 'add to'];
    case 'whatsapp':
      return ['whatsapp', 'হোয়াটস', 'wa\\.me'];
    case 'call':
      return ['call', 'কল', 'tel:', 'phone', 'ফোন'];
    default:
      return [];
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
