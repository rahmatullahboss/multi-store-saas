/**
 * SEO Component
 * 
 * Renders meta tags and JSON-LD structured data for pages
 */

import { type SEOConfig, generateMetaTags, generateJsonLdScript } from '~/lib/seo.server';

interface SEOProps {
  config: SEOConfig;
  schemas?: object[];
  canonicalUrl?: string;
}

/**
 * SEO Head Component - renders meta tags
 * Use this in your route's meta export
 */
export function generateSEOMeta(config: SEOConfig): Array<{ title?: string; name?: string; property?: string; content?: string }> {
  const meta: Array<{ title?: string; name?: string; property?: string; content?: string }> = [];
  
  // Title
  if (config.title) {
    meta.push({ title: config.title });
  }

  // Meta tags
  const tags = generateMetaTags(config);
  meta.push(...tags);

  return meta;
}

/**
 * JSON-LD Script Component
 * Renders structured data in script tag
 */
export function JsonLdScript({ schemas }: { schemas: object | object[] }) {
  const jsonLd = generateJsonLdScript(schemas);
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

/**
 * Canonical Link Component
 */
export function CanonicalLink({ url }: { url: string }) {
  return <link rel="canonical" href={url} />;
}

/**
 * Combined SEO Component for use in page components
 */
export function SEOHead({ config: _config, schemas, canonicalUrl }: SEOProps) {
  return (
    <>
      {canonicalUrl && <CanonicalLink url={canonicalUrl} />}
      {schemas && schemas.length > 0 && <JsonLdScript schemas={schemas} />}
    </>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Build store URL
 */
export function buildStoreUrl(subdomain: string, path: string = ''): string {
  const baseUrl = process.env.APP_URL || 'https://ozzyl.com';
  return `${baseUrl.replace('://', `://${subdomain}.`)}${path}`;
}

/**
 * Truncate text for meta description
 */
export function truncateForMeta(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Generate product URL
 */
export function buildProductUrl(subdomain: string, productHandle: string): string {
  return buildStoreUrl(subdomain, `/products/${productHandle}`);
}

/**
 * Generate collection URL
 */
export function buildCollectionUrl(subdomain: string, collectionHandle: string): string {
  return buildStoreUrl(subdomain, `/collections/${collectionHandle}`);
}

/**
 * Strip HTML tags from text
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// ============================================================================
// DEFAULT EXPORTS
// ============================================================================

export {
  type SEOConfig,
  generateMetaTags,
  generateJsonLdScript,
};
