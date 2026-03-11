/**
 * A simple whitelist-based HTML sanitizer to prevent XSS.
 * Allows only specific safe tags and attributes.
 */

const ALLOWED_TAGS = new Set([
  'span', 'b', 'i', 'strong', 'em', 'br', 'u', 'p', 'div',
  'a', 'img', 'svg', 'rect', 'path', 'g', 'circle', 'line', 'polyline', 'polygon',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'small'
]);

const ALLOWED_ATTRIBUTES = new Set([
  'class', 'id', 'href', 'src', 'alt', 'target', 'rel',
  'width', 'height', 'viewbox', 'fill', 'stroke', 'stroke-width',
  'stroke-linecap', 'stroke-linejoin', 'd', 'x', 'y', 'rx', 'ry',
  'xmlns'
]);

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
      if (ALLOWED_ATTRIBUTES.has(attrName)) {
        const attrValue = attrMatch[2] || attrMatch[3] || attrMatch[4] || '';

        // Block dangerous URIs in href and src
        if ((attrName === 'href' || attrName === 'src') &&
            /^(?:javascript|vbscript|data):/i.test(attrValue.trim())) {
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
