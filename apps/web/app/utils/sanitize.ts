/**
 * Simple isomorphic HTML sanitizer using a whitelist approach.
 *
 * This provides protection against XSS by:
 * 1. Completely removing dangerous tags (script, iframe, etc.) and their content.
 * 2. Only allowing a safe whitelist of tags (span, b, i, etc.).
 * 3. Only allowing safe attributes (class, id).
 *
 * Note: While a robust library like DOMPurify is generally preferred,
 * this implementation provides essential security in environments where
 * external dependencies are restricted.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  let clean = html;

  // 1. Remove dangerous tags and their content
  const tagsToFullStrip = ['script', 'style', 'iframe', 'object', 'embed', 'noscript'];
  tagsToFullStrip.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    clean = clean.replace(regex, '');
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/>`, 'gi');
    clean = clean.replace(selfClosingRegex, '');
  });

  // 2. Filter remaining tags and their attributes
  const ALLOWED_TAGS = ['span', 'b', 'i', 'strong', 'em', 'br', 'u', 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'small', 'big'];
  const ALLOWED_ATTRS = ['class', 'className', 'id'];

  return clean.replace(/<(\/?)(\w+)([^>]*)>/gi, (match, closingSlash, tagName, attributes) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.includes(tag)) {
      return '';
    }

    let cleanAttributes = '';
    const attrRegex = /\s+([a-zA-Z-]+)\s*=\s*("[^"]*"|'[^']*'|[^"\s>]+)/gi;
    let m;
    while ((m = attrRegex.exec(attributes)) !== null) {
      const attrName = m[1].toLowerCase();
      if (ALLOWED_ATTRS.includes(attrName)) {
        cleanAttributes += m[0];
      }
    }

    return `<${closingSlash}${tagName}${cleanAttributes}>`;
  });
}
