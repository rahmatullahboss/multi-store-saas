/**
 * SEO Utilities Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateCollectionSchema,
  generateMetaTags,
  generateJsonLdScript,
  generateHomePageSchemas,
  generateProductPageSchemas,
  type StoreInfo,
  type ProductInfo,
} from '~/lib/seo.server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonLdSchema = Record<string, any>;

describe('SEO Utilities', () => {
  const mockStore: StoreInfo = {
    name: 'Test Store',
    description: 'A test store description',
    logo: 'https://example.com/logo.png',
    url: 'https://test-store.com',
    phone: '+8801234567890',
    email: 'test@store.com',
    address: {
      street: '123 Main St',
      city: 'Dhaka',
      country: 'Bangladesh',
    },
    socialLinks: {
      facebook: 'https://facebook.com/teststore',
      instagram: 'https://instagram.com/teststore',
    },
  };

  const mockProduct: ProductInfo = {
    id: '123',
    name: 'Test Product',
    description: 'A test product description',
    price: 1000,
    compareAtPrice: 1500,
    currency: 'BDT',
    image: 'https://example.com/product.jpg',
    sku: 'SKU-123',
    brand: 'Test Brand',
    category: 'Electronics',
    availability: 'InStock',
    rating: { value: 4.5, count: 100 },
    url: 'https://test-store.com/products/test-product',
  };

  describe('generateOrganizationSchema', () => {
    it('should generate valid organization schema', () => {
      const schema = generateOrganizationSchema(mockStore) as JsonLdSchema;
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema['name']).toBe('Test Store');
      expect(schema['url']).toBe('https://test-store.com');
    });

    it('should include logo when provided', () => {
      const schema = generateOrganizationSchema(mockStore) as JsonLdSchema;
      expect(schema['logo']).toBeDefined();
      expect(schema['logo']['url']).toBe('https://example.com/logo.png');
    });

    it('should include contact info', () => {
      const schema = generateOrganizationSchema(mockStore) as JsonLdSchema;
      expect(schema['telephone']).toBe('+8801234567890');
      expect(schema['email']).toBe('test@store.com');
    });

    it('should include address', () => {
      const schema = generateOrganizationSchema(mockStore) as JsonLdSchema;
      expect(schema['address']).toBeDefined();
      expect(schema['address']['@type']).toBe('PostalAddress');
      expect(schema['address']['addressLocality']).toBe('Dhaka');
    });

    it('should include social links as sameAs', () => {
      const schema = generateOrganizationSchema(mockStore) as JsonLdSchema;
      expect(schema['sameAs']).toBeDefined();
      expect(schema['sameAs']).toContain('https://facebook.com/teststore');
    });
  });

  describe('generateWebSiteSchema', () => {
    it('should generate valid website schema', () => {
      const schema = generateWebSiteSchema(mockStore) as JsonLdSchema;
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema['name']).toBe('Test Store');
    });

    it('should include search action', () => {
      const schema = generateWebSiteSchema(mockStore) as JsonLdSchema;
      expect(schema['potentialAction']).toBeDefined();
      expect(schema['potentialAction']['@type']).toBe('SearchAction');
    });
  });

  describe('generateProductSchema', () => {
    it('should generate valid product schema', () => {
      const schema = generateProductSchema(mockProduct, mockStore) as JsonLdSchema;
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Product');
      expect(schema['name']).toBe('Test Product');
    });

    it('should include offers with price', () => {
      const schema = generateProductSchema(mockProduct, mockStore) as JsonLdSchema;
      expect(schema['offers']).toBeDefined();
      expect(schema['offers']['@type']).toBe('Offer');
      expect(schema['offers']['price']).toBe(1000);
      expect(schema['offers']['priceCurrency']).toBe('BDT');
    });

    it('should include availability', () => {
      const schema = generateProductSchema(mockProduct, mockStore) as JsonLdSchema;
      expect(schema['offers']['availability']).toContain('InStock');
    });

    it('should include brand', () => {
      const schema = generateProductSchema(mockProduct, mockStore) as JsonLdSchema;
      expect(schema['brand']).toBeDefined();
      expect(schema['brand']['name']).toBe('Test Brand');
    });

    it('should include aggregate rating', () => {
      const schema = generateProductSchema(mockProduct, mockStore) as JsonLdSchema;
      expect(schema['aggregateRating']).toBeDefined();
      expect(schema['aggregateRating']['ratingValue']).toBe(4.5);
      expect(schema['aggregateRating']['reviewCount']).toBe(100);
    });

    it('should include SKU', () => {
      const schema = generateProductSchema(mockProduct, mockStore) as JsonLdSchema;
      expect(schema['sku']).toBe('SKU-123');
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('should generate valid breadcrumb schema', () => {
      const breadcrumbs = [
        { name: 'Home', url: 'https://test-store.com' },
        { name: 'Electronics', url: 'https://test-store.com/collections/electronics' },
        { name: 'Test Product', url: 'https://test-store.com/products/test-product' },
      ];
      const schema = generateBreadcrumbSchema(breadcrumbs) as JsonLdSchema;
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema['itemListElement']).toHaveLength(3);
    });

    it('should have correct positions', () => {
      const breadcrumbs = [
        { name: 'Home', url: 'https://test-store.com' },
        { name: 'Category', url: 'https://test-store.com/category' },
      ];
      const schema = generateBreadcrumbSchema(breadcrumbs) as JsonLdSchema;
      expect(schema['itemListElement'][0]['position']).toBe(1);
      expect(schema['itemListElement'][1]['position']).toBe(2);
    });
  });

  describe('generateCollectionSchema', () => {
    it('should generate valid collection schema', () => {
      const collection = {
        name: 'Electronics',
        description: 'Electronic products',
        url: 'https://test-store.com/collections/electronics',
        productCount: 50,
      };
      const schema = generateCollectionSchema(collection, mockStore) as JsonLdSchema;
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('CollectionPage');
      expect(schema['name']).toBe('Electronics');
      expect(schema['numberOfItems']).toBe(50);
    });
  });

  describe('generateMetaTags', () => {
    it('should generate description meta tag', () => {
      const tags = generateMetaTags({ description: 'Test description' });
      const descTag = tags.find((t) => t.name === 'description');
      expect(descTag).toBeDefined();
      expect(descTag?.content).toBe('Test description');
    });

    it('should generate keywords meta tag', () => {
      const tags = generateMetaTags({ keywords: ['test', 'keywords'] });
      const keywordsTag = tags.find((t) => t.name === 'keywords');
      expect(keywordsTag).toBeDefined();
      expect(keywordsTag?.content).toBe('test, keywords');
    });

    it('should generate robots meta tag', () => {
      const tags = generateMetaTags({ noIndex: true, noFollow: true });
      const robotsTag = tags.find((t) => t.name === 'robots');
      expect(robotsTag).toBeDefined();
      expect(robotsTag?.content).toContain('noindex');
      expect(robotsTag?.content).toContain('nofollow');
    });

    it('should generate Open Graph tags', () => {
      const tags = generateMetaTags({
        title: 'Test Title',
        description: 'Test Description',
        ogImage: 'https://example.com/og.jpg',
        ogType: 'product',
      });
      expect(tags.find((t) => t.property === 'og:title')).toBeDefined();
      expect(tags.find((t) => t.property === 'og:description')).toBeDefined();
      expect(tags.find((t) => t.property === 'og:image')).toBeDefined();
      expect(tags.find((t) => t.property === 'og:type')).toBeDefined();
    });

    it('should generate Twitter card tags', () => {
      const tags = generateMetaTags({
        title: 'Test Title',
        twitterCard: 'summary_large_image',
      });
      expect(tags.find((t) => t.name === 'twitter:card')).toBeDefined();
      expect(tags.find((t) => t.name === 'twitter:title')).toBeDefined();
    });
  });

  describe('generateJsonLdScript', () => {
    it('should generate JSON string for single schema', () => {
      const schema = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Test' };
      const result = generateJsonLdScript(schema);
      expect(result).toContain('"@context"');
      expect(result).toContain('"@type":"Organization"');
    });

    it('should generate @graph for multiple schemas', () => {
      const schemas = [
        { '@context': 'https://schema.org', '@type': 'Organization', name: 'Test' },
        { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Test' },
      ];
      const result = generateJsonLdScript(schemas);
      expect(result).toContain('@graph');
    });
  });

  describe('generateHomePageSchemas', () => {
    it('should return organization and website schemas', () => {
      const schemas = generateHomePageSchemas(mockStore) as JsonLdSchema[];
      expect(schemas).toHaveLength(2);
      expect(schemas[0]['@type']).toBe('Organization');
      expect(schemas[1]['@type']).toBe('WebSite');
    });
  });

  describe('generateProductPageSchemas', () => {
    it('should return product schema', () => {
      const schemas = generateProductPageSchemas(mockProduct, mockStore) as JsonLdSchema[];
      expect(schemas.length).toBeGreaterThanOrEqual(1);
      expect(schemas[0]['@type']).toBe('Product');
    });

    it('should include breadcrumbs when provided', () => {
      const breadcrumbs = [
        { name: 'Home', url: 'https://test-store.com' },
        { name: 'Product', url: 'https://test-store.com/products/test' },
      ];
      const schemas = generateProductPageSchemas(
        mockProduct,
        mockStore,
        breadcrumbs
      ) as JsonLdSchema[];
      expect(schemas).toHaveLength(2);
      expect(schemas[1]['@type']).toBe('BreadcrumbList');
    });
  });
});
