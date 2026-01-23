/**
 * Product Schema Component - JSON-LD Structured Data
 * 
 * Adds Schema.org Product markup for better SEO and rich search results.
 * https://developers.google.com/search/docs/appearance/structured-data/product
 */

interface ProductSchemaProps {
  product: {
    title: string;
    description?: string | null;
    price: number;
    compareAtPrice?: number | null;
    imageUrl?: string | null;
    images?: string | null;
    inventory?: number | null;
  };
  storeName: string;
  currency?: string;
  url?: string;
}

export function ProductSchema({ product, storeName, currency = 'BDT', url }: ProductSchemaProps) {
  // Parse images if JSON string
  let images: string[] = [];
  if (product.imageUrl) {
    images.push(product.imageUrl);
  }
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed)) {
        images = [...images, ...parsed];
      }
    } catch {
      // Ignore parse errors
    }
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || undefined,
    image: images.length > 0 ? images : undefined,
    brand: {
      '@type': 'Brand',
      name: storeName,
    },
    offers: {
      '@type': 'Offer',
      url: url || undefined,
      priceCurrency: currency,
      price: product.price,
      availability: product.inventory && product.inventory > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      ...(product.compareAtPrice && product.compareAtPrice > product.price ? {
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: product.price,
          priceCurrency: currency,
          priceType: 'https://schema.org/SalePrice',
        }
      } : {}),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Store/Organization Schema
 */
interface StoreSchemaProps {
  storeName: string;
  url?: string;
  logo?: string | null;
  description?: string;
}

export function StoreSchema({ storeName, url, logo, description }: StoreSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: storeName,
    url: url || undefined,
    logo: logo || undefined,
    description: description || undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
