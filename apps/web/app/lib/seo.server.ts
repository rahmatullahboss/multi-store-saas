/**
 * SEO Server Utilities
 * 
 * Generates structured data (JSON-LD) for search engines
 * Follows Schema.org standards and Google's structured data guidelines
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface StoreInfo {
  name: string;
  description?: string;
  logo?: string;
  url: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface ProductInfo {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  image?: string;
  images?: string[];
  sku?: string;
  brand?: string;
  category?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued';
  rating?: {
    value: number;
    count: number;
  };
  url: string;
}

export interface CollectionInfo {
  name: string;
  description?: string;
  image?: string;
  url: string;
  productCount?: number;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

// ============================================================================
// JSON-LD GENERATORS
// ============================================================================

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(store: StoreInfo): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: store.name,
    url: store.url,
  };

  if (store.description) {
    schema.description = store.description;
  }

  if (store.logo) {
    schema.logo = {
      '@type': 'ImageObject',
      url: store.logo,
    };
  }

  if (store.phone) {
    schema.telephone = store.phone;
  }

  if (store.email) {
    schema.email = store.email;
  }

  if (store.address) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(store.address.street && { streetAddress: store.address.street }),
      ...(store.address.city && { addressLocality: store.address.city }),
      ...(store.address.state && { addressRegion: store.address.state }),
      ...(store.address.postalCode && { postalCode: store.address.postalCode }),
      ...(store.address.country && { addressCountry: store.address.country }),
    };
  }

  if (store.socialLinks) {
    const sameAs = Object.values(store.socialLinks).filter(Boolean);
    if (sameAs.length > 0) {
      schema.sameAs = sameAs;
    }
  }

  return schema;
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema(store: StoreInfo): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: store.name,
    url: store.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${store.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Product schema
 */
export function generateProductSchema(product: ProductInfo, store: StoreInfo): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    url: product.url,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'BDT',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      seller: {
        '@type': 'Organization',
        name: store.name,
      },
    },
  };

  if (product.description) {
    schema.description = product.description;
  }

  if (product.image) {
    schema.image = product.image;
  } else if (product.images && product.images.length > 0) {
    schema.image = product.images;
  }

  if (product.sku) {
    schema.sku = product.sku;
  }

  if (product.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: product.brand,
    };
  }

  if (product.category) {
    schema.category = product.category;
  }

  if (product.rating && product.rating.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.value,
      reviewCount: product.rating.count,
    };
  }

  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    schema.offers.priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate CollectionPage schema
 */
export function generateCollectionSchema(collection: CollectionInfo, store: StoreInfo): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    url: collection.url,
    isPartOf: {
      '@type': 'WebSite',
      name: store.name,
      url: store.url,
    },
  };

  if (collection.description) {
    schema.description = collection.description;
  }

  if (collection.image) {
    schema.image = collection.image;
  }

  if (collection.productCount) {
    schema.numberOfItems = collection.productCount;
  }

  return schema;
}

/**
 * Generate LocalBusiness schema (for physical stores)
 */
export function generateLocalBusinessSchema(store: StoreInfo & { 
  openingHours?: string[];
  priceRange?: string;
}): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    url: store.url,
  };

  if (store.description) {
    schema.description = store.description;
  }

  if (store.logo) {
    schema.image = store.logo;
  }

  if (store.phone) {
    schema.telephone = store.phone;
  }

  if (store.email) {
    schema.email = store.email;
  }

  if (store.address) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(store.address.street && { streetAddress: store.address.street }),
      ...(store.address.city && { addressLocality: store.address.city }),
      ...(store.address.state && { addressRegion: store.address.state }),
      ...(store.address.postalCode && { postalCode: store.address.postalCode }),
      ...(store.address.country && { addressCountry: store.address.country }),
    };
  }

  if (store.openingHours) {
    schema.openingHours = store.openingHours;
  }

  if (store.priceRange) {
    schema.priceRange = store.priceRange;
  }

  return schema;
}

// ============================================================================
// META TAG GENERATORS
// ============================================================================

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(config: SEOConfig): Array<{ name?: string; property?: string; content: string }> {
  const tags: Array<{ name?: string; property?: string; content: string }> = [];

  if (config.description) {
    tags.push({ name: 'description', content: config.description });
  }

  if (config.keywords && config.keywords.length > 0) {
    tags.push({ name: 'keywords', content: config.keywords.join(', ') });
  }

  // Robots
  const robotsDirectives: string[] = [];
  if (config.noIndex) robotsDirectives.push('noindex');
  if (config.noFollow) robotsDirectives.push('nofollow');
  if (robotsDirectives.length > 0) {
    tags.push({ name: 'robots', content: robotsDirectives.join(', ') });
  }

  // Open Graph
  if (config.title) {
    tags.push({ property: 'og:title', content: config.title });
  }
  if (config.description) {
    tags.push({ property: 'og:description', content: config.description });
  }
  if (config.ogImage) {
    tags.push({ property: 'og:image', content: config.ogImage });
  }
  if (config.ogType) {
    tags.push({ property: 'og:type', content: config.ogType });
  }
  if (config.canonicalUrl) {
    tags.push({ property: 'og:url', content: config.canonicalUrl });
  }

  // Twitter
  if (config.twitterCard) {
    tags.push({ name: 'twitter:card', content: config.twitterCard });
  }
  if (config.title) {
    tags.push({ name: 'twitter:title', content: config.title });
  }
  if (config.description) {
    tags.push({ name: 'twitter:description', content: config.description });
  }
  if (config.ogImage) {
    tags.push({ name: 'twitter:image', content: config.ogImage });
  }

  return tags;
}

// ============================================================================
// COMBINED SCHEMA GENERATOR
// ============================================================================

/**
 * Generate all schemas for homepage
 */
export function generateHomePageSchemas(store: StoreInfo): object[] {
  return [
    generateOrganizationSchema(store),
    generateWebSiteSchema(store),
  ];
}

/**
 * Generate all schemas for product page
 */
export function generateProductPageSchemas(
  product: ProductInfo, 
  store: StoreInfo,
  breadcrumbs?: BreadcrumbItem[]
): object[] {
  const schemas = [
    generateProductSchema(product, store),
  ];

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(breadcrumbs));
  }

  return schemas;
}

/**
 * Generate all schemas for collection page
 */
export function generateCollectionPageSchemas(
  collection: CollectionInfo,
  store: StoreInfo,
  breadcrumbs?: BreadcrumbItem[]
): object[] {
  const schemas = [
    generateCollectionSchema(collection, store),
  ];

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(breadcrumbs));
  }

  return schemas;
}

// ============================================================================
// JSON-LD SCRIPT TAG GENERATOR
// ============================================================================

/**
 * Generate JSON-LD script tag content
 */
export function generateJsonLdScript(schemas: object | object[]): string {
  const schemaArray = Array.isArray(schemas) ? schemas : [schemas];
  
  if (schemaArray.length === 1) {
    return JSON.stringify(schemaArray[0]);
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': schemaArray.map(s => {
      const { '@context': _, ...rest } = s as any;
      return rest;
    }),
  });
}
