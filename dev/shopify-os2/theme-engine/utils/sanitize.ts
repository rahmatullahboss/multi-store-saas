import sanitizeHtmlLib from 'sanitize-html';

/**
 * A wrapper around sanitize-html to prevent XSS.
 * Allows specific safe tags and attributes.
 *
 * NOTE: This should NOT be used on intentional raw injection fields like
 * customHeadCode, customBodyCode, customCSS — those are merchant-controlled
 * script/style injections that need to remain executable.
 */

const ALLOWED_TAGS = [
  'span', 'b', 'i', 'strong', 'em', 'br', 'u', 'p', 'div',
  'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
  'svg', 'rect', 'path', 'g', 'circle', 'line', 'polyline', 'polygon',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'small', 'button', 'label',
];

const ALLOWED_ATTRIBUTES = {
  '*': ['class', 'id', 'style', 'xmlns', 'type', 'role', 'aria-label', 'aria-hidden'],
  'a': ['href', 'target', 'rel'],
  'img': ['src', 'alt', 'width', 'height'],
  'svg': ['width', 'height', 'viewbox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
  'rect': ['x', 'y', 'width', 'height', 'rx', 'ry', 'fill'],
  'path': ['d', 'fill', 'stroke'],
  'g': ['fill', 'stroke'],
  'circle': ['fill', 'stroke'],
  'line': ['fill', 'stroke'],
  'polyline': ['fill', 'stroke'],
  'polygon': ['fill', 'stroke'],
};

export function sanitizeHtml(html: string | null | undefined): string {
  if (typeof html !== 'string') return '';

  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data']
    },
    allowProtocolRelative: false,
  });
}
