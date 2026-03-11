/**
 * A simple whitelist-based HTML sanitizer to prevent XSS.
 * Allows only specific safe tags and attributes.
 * 
 * NOTE: This should NOT be used on intentional raw injection fields like
 * customHeadCode, customBodyCode, customCSS — those are merchant-controlled
 * script/style injections that need to remain executable.
 */

const ALLOWED_TAGS = new Set([
  'span', 'b', 'i', 'strong', 'em', 'br', 'u', 'p', 'div',
  'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
  'svg', 'rect', 'path', 'g', 'circle', 'line', 'polyline', 'polygon',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'small', 'button', 'label',
]);

const ALLOWED_ATTRIBUTES = new Set([
  'class', 'id', 'style', 'href', 'src', 'alt', 'target', 'rel',
  'width', 'height', 'viewbox', 'fill', 'stroke', 'stroke-width',
  'stroke-linecap', 'stroke-linejoin', 'd', 'x', 'y', 'rx', 'ry',
  'xmlns', 'type', 'role', 'aria-label', 'aria-hidden',
]);

/**
 * Decode HTML entities so encoded schemes like javascript&#x3a; are caught.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'");
}

/**
 * Check if a URI value is dangerous (javascript:, vbscript:, data:).
 * Decodes HTML entities and strips whitespace/control chars first.
 */
function isDangerousUri(value: string): boolean {
  const decoded = decodeHtmlEntities(value)
    .replace(/[\u0000-\u001f\u007f\s]+/g, '') // strip control chars & whitespace
    .trim();
  return /^(?:javascript|vbscript|data):/i.test(decoded);
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (typeof html !== 'string') return '';

  // Remove dangerous tags and their contents
  let sanitized = html.replace(/<(script|style|iframe|object|embed|applet)[^>]*>[\s\S]*?<\/\1>/gi, '');

  // Remove HTML comments
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

  // Strip or sanitize all other tags
  sanitized = sanitized.replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (match, tag, attrsStr) => {
    const lowerTag = tag.toLowerCase();

    // If tag is not allowed, strip it completely
    if (!ALLOWED_TAGS.has(lowerTag)) {
      return '';
    }

    // If it's a closing tag, ensure it's properly formatted
    if (match.startsWith('</')) {
      return `</${lowerTag}>`;
    }

    // For opening tags, filter attributes
    let attributesStr = '';
    const attrRegex = /([a-z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const isAllowed = ALLOWED_ATTRIBUTES.has(attrName) || attrName.startsWith('data-');

      if (isAllowed) {
        const attrValue = attrMatch[2] || attrMatch[3] || attrMatch[4] || '';

        // Block dangerous URIs in href and src (decode entities first)
        if ((attrName === 'href' || attrName === 'src') && isDangerousUri(attrValue)) {
          continue;
        }

        const escapedValue = attrValue.replace(/"/g, '&quot;');
        attributesStr += ` ${attrName}="${escapedValue}"`;
      }
    }

    const isSelfClosing = match.endsWith('/>');
    return `<${lowerTag}${attributesStr}${isSelfClosing ? ' />' : '>'}`;
  });

  return sanitized;
}
