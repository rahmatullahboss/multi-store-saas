/**
 * Metafield Resolver - Load and resolve metafields for products, collections, and stores
 *
 * This utility:
 * - Fetches metafields from the database
 * - Caches metafields for performance
 * - Resolves metafield bindings in section settings
 * - Provides type-safe access to metafield values
 */

import type { SerializedProduct, SerializedCollection, ProductVariant } from '../types';

// ============================================================================
// METAFIELD TYPES
// ============================================================================

export type MetafieldType =
  | 'single_line_text_field'
  | 'multi_line_text_field'
  | 'rich_text_field'
  | 'number_integer'
  | 'number_decimal'
  | 'boolean'
  | 'date'
  | 'date_time'
  | 'url'
  | 'color'
  | 'json'
  | 'file_reference'
  | 'product_reference'
  | 'collection_reference'
  | 'list.single_line_text_field'
  | 'list.number_integer'
  | 'list.product_reference'
  | 'list.file_reference';

export type MetafieldOwnerType = 'product' | 'collection' | 'store' | 'page' | 'variant';

export interface MetafieldValue {
  namespace: string;
  key: string;
  value: unknown;
  type: MetafieldType;
}

export interface ResolvedMetafields {
  [key: string]: unknown; // Format: "namespace.key" -> value
}

// ============================================================================
// PRODUCT TYPE DETECTION
// ============================================================================

/**
 * Product type categories for template selection
 */
export type ProductTypeCategory =
  | 'fashion'
  | 'electronics'
  | 'food'
  | 'beauty'
  | 'home'
  | 'sports'
  | 'books'
  | 'general';

/**
 * Keywords for detecting product type
 */
const PRODUCT_TYPE_KEYWORDS: Record<ProductTypeCategory, string[]> = {
  fashion: [
    'clothing',
    'apparel',
    'fashion',
    'dress',
    'shirt',
    'pants',
    'jeans',
    'shoes',
    'footwear',
    'accessories',
    'jewelry',
    'watch',
    'bag',
    'handbag',
    'saree',
    'shari',
    'salwar',
    'kameez',
    'panjabi',
    'kurta',
    'lehenga',
    't-shirt',
    'jacket',
    'coat',
    'sweater',
    'hoodie',
    'cap',
    'hat',
    'scarf',
    'belt',
    'wallet',
    'sunglasses',
    'ornament',
  ],
  electronics: [
    'electronics',
    'gadget',
    'phone',
    'mobile',
    'smartphone',
    'laptop',
    'computer',
    'pc',
    'tablet',
    'camera',
    'headphone',
    'earphone',
    'earbuds',
    'speaker',
    'tv',
    'television',
    'monitor',
    'keyboard',
    'mouse',
    'charger',
    'powerbank',
    'cable',
    'adapter',
    'router',
    'wifi',
    'smart',
    'watch',
    'band',
    'drone',
    'gaming',
    'console',
    'appliance',
  ],
  food: [
    'food',
    'grocery',
    'snack',
    'beverage',
    'drink',
    'coffee',
    'tea',
    'spice',
    'masala',
    'rice',
    'dal',
    'oil',
    'ghee',
    'honey',
    'chocolate',
    'candy',
    'biscuit',
    'chips',
    'nuts',
    'dry fruits',
    'organic',
    'fresh',
    'frozen',
    'canned',
  ],
  beauty: [
    'beauty',
    'cosmetic',
    'makeup',
    'skincare',
    'haircare',
    'perfume',
    'fragrance',
    'lotion',
    'cream',
    'serum',
    'shampoo',
    'conditioner',
    'lipstick',
    'mascara',
    'foundation',
    'nail',
    'spa',
    'wellness',
  ],
  home: [
    'home',
    'furniture',
    'decor',
    'decoration',
    'kitchen',
    'cookware',
    'bedding',
    'mattress',
    'pillow',
    'curtain',
    'rug',
    'carpet',
    'lamp',
    'lighting',
    'storage',
    'organizer',
    'garden',
    'outdoor',
  ],
  sports: [
    'sports',
    'fitness',
    'gym',
    'exercise',
    'yoga',
    'running',
    'cycling',
    'swimming',
    'football',
    'cricket',
    'badminton',
    'outdoor',
    'camping',
    'hiking',
    'adventure',
  ],
  books: [
    'book',
    'novel',
    'textbook',
    'magazine',
    'stationery',
    'pen',
    'notebook',
    'diary',
    'educational',
    'learning',
  ],
  general: [],
};

/**
 * Detect product type category from product data
 */
export function detectProductType(product: SerializedProduct): ProductTypeCategory {
  // Check explicit metafield first
  const explicitType = product.metafields?.product_type as string | undefined;
  if (explicitType && isValidProductType(explicitType)) {
    return explicitType as ProductTypeCategory;
  }

  // Build searchable text
  const searchText = [product.title, product.description, product.category, ...(product.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Check each category
  for (const [category, keywords] of Object.entries(PRODUCT_TYPE_KEYWORDS)) {
    if (category === 'general') continue;

    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return category as ProductTypeCategory;
      }
    }
  }

  return 'general';
}

function isValidProductType(type: string): boolean {
  return Object.keys(PRODUCT_TYPE_KEYWORDS).includes(type);
}

/**
 * Get template variant based on product type
 */
export function getProductTemplateVariant(product: SerializedProduct): string {
  const productType = detectProductType(product);

  switch (productType) {
    case 'fashion':
      return 'product.fashion';
    case 'electronics':
      return 'product.electronics';
    default:
      return 'product';
  }
}

// ============================================================================
// METAFIELD RESOLVERS
// ============================================================================

/**
 * Parse metafield value based on type
 */
export function parseMetafieldValue(value: string, type: MetafieldType): unknown {
  try {
    switch (type) {
      case 'number_integer':
        return parseInt(value, 10);
      case 'number_decimal':
        return parseFloat(value);
      case 'boolean':
        return value === 'true' || value === '1';
      case 'json':
      case 'list.single_line_text_field':
      case 'list.number_integer':
      case 'list.product_reference':
      case 'list.file_reference':
        return JSON.parse(value);
      case 'date':
      case 'date_time':
        return new Date(value);
      default:
        return value;
    }
  } catch {
    return value;
  }
}

/**
 * Convert flat metafield array to nested object
 */
export function flattenMetafields(metafields: MetafieldValue[]): ResolvedMetafields {
  const result: ResolvedMetafields = {};

  for (const mf of metafields) {
    const key = `${mf.namespace}.${mf.key}`;
    result[key] = mf.value;

    // Also add to nested structure
    if (!result[mf.namespace]) {
      result[mf.namespace] = {};
    }
    (result[mf.namespace] as Record<string, unknown>)[mf.key] = mf.value;
  }

  return result;
}

/**
 * Get a metafield value by namespace and key
 */
export function getMetafieldValue(
  metafields: ResolvedMetafields | undefined,
  namespace: string,
  key: string
): unknown {
  if (!metafields) return undefined;

  // Try dot notation first
  const dotKey = `${namespace}.${key}`;
  if (metafields[dotKey] !== undefined) {
    return metafields[dotKey];
  }

  // Try nested structure
  const nsData = metafields[namespace];
  if (typeof nsData === 'object' && nsData !== null) {
    return (nsData as Record<string, unknown>)[key];
  }

  return undefined;
}

/**
 * Check if a metafield exists and has a value
 */
export function hasMetafieldValue(
  metafields: ResolvedMetafields | undefined,
  namespace: string,
  key: string
): boolean {
  const value = getMetafieldValue(metafields, namespace, key);
  return value !== undefined && value !== null && value !== '';
}

// ============================================================================
// PRODUCT-SPECIFIC METAFIELD HELPERS
// ============================================================================

/**
 * Common product metafield namespaces
 */
export const PRODUCT_METAFIELD_NAMESPACES = {
  PRODUCT_INFO: 'product_info',
  CUSTOM: 'custom',
  SHIPPING: 'shipping',
  REVIEWS: 'reviews',
  SEO: 'seo',
} as const;

/**
 * Fashion product metafield keys
 */
export const FASHION_METAFIELDS = {
  FABRIC: 'fabric',
  FIT_TYPE: 'fit_type',
  CARE_INSTRUCTIONS: 'care_instructions',
  SIZE_CHART: 'size_chart',
  MODEL_INFO: 'model_info',
  COMPLEMENTARY: 'complementary_products',
} as const;

/**
 * Electronics product metafield keys
 */
export const ELECTRONICS_METAFIELDS = {
  WARRANTY: 'warranty',
  WARRANTY_YEARS: 'warranty_years',
  POWER_SPECS: 'power_specs',
  COMPATIBILITY: 'compatibility',
  KEY_FEATURES: 'key_features',
  SPECIFICATIONS: 'specifications',
  ACCESSORIES: 'accessories',
  COMPARISON_PRODUCTS: 'comparison_products',
} as const;

/**
 * Get fashion-specific metafields from product
 */
export function getFashionMetafields(product: SerializedProduct) {
  const mf = product.metafields || {};
  const ns = PRODUCT_METAFIELD_NAMESPACES.PRODUCT_INFO;

  return {
    fabric: getMetafieldValue(mf, ns, FASHION_METAFIELDS.FABRIC) as string | undefined,
    fitType: getMetafieldValue(mf, ns, FASHION_METAFIELDS.FIT_TYPE) as string | undefined,
    careInstructions: getMetafieldValue(mf, ns, FASHION_METAFIELDS.CARE_INSTRUCTIONS) as
      | string
      | undefined,
    sizeChart: getMetafieldValue(mf, ns, FASHION_METAFIELDS.SIZE_CHART) as string | undefined,
    modelInfo: getMetafieldValue(mf, ns, FASHION_METAFIELDS.MODEL_INFO) as string | undefined,
    complementaryProducts: getMetafieldValue(mf, ns, FASHION_METAFIELDS.COMPLEMENTARY) as
      | number[]
      | undefined,
  };
}

/**
 * Get electronics-specific metafields from product
 */
export function getElectronicsMetafields(product: SerializedProduct) {
  const mf = product.metafields || {};
  const ns = PRODUCT_METAFIELD_NAMESPACES.PRODUCT_INFO;

  return {
    warranty: getMetafieldValue(mf, ns, ELECTRONICS_METAFIELDS.WARRANTY) as string | undefined,
    warrantyYears: getMetafieldValue(mf, ns, ELECTRONICS_METAFIELDS.WARRANTY_YEARS) as
      | number
      | undefined,
    powerSpecs: getMetafieldValue(mf, ns, ELECTRONICS_METAFIELDS.POWER_SPECS) as string | undefined,
    compatibility: getMetafieldValue(mf, ns, ELECTRONICS_METAFIELDS.COMPATIBILITY) as
      | string
      | undefined,
    keyFeatures: getMetafieldValue(mf, ns, ELECTRONICS_METAFIELDS.KEY_FEATURES) as
      | string[]
      | undefined,
    specifications: getMetafieldValue(mf, ns, ELECTRONICS_METAFIELDS.SPECIFICATIONS) as
      | Record<string, string>
      | undefined,
    accessories: getMetafieldValue(mf, ns, ELECTRONICS_METAFIELDS.ACCESSORIES) as
      | number[]
      | undefined,
    comparisonProducts: getMetafieldValue(mf, ns, ELECTRONICS_METAFIELDS.COMPARISON_PRODUCTS) as
      | number[]
      | undefined,
  };
}

// ============================================================================
// VARIANT HELPERS
// ============================================================================

/**
 * Get variant display title (e.g., "Red / Large")
 */
export function getVariantTitle(variant: {
  option1Value?: string | null;
  option2Value?: string | null;
  option3Value?: string | null;
}): string {
  return [variant.option1Value, variant.option2Value, variant.option3Value]
    .filter(Boolean)
    .join(' / ');
}

/**
 * Get unique option values for a product
 */
export function getProductOptions(product: SerializedProduct): {
  option1: { name: string; values: string[] } | null;
  option2: { name: string; values: string[] } | null;
  option3: { name: string; values: string[] } | null;
} {
  const variants = product.variants || [];

  if (variants.length === 0) {
    return { option1: null, option2: null, option3: null };
  }

  const option1Name = variants[0]?.option1Name;
  const option2Name = variants[0]?.option2Name;
  const option3Name = variants[0]?.option3Name;

  const option1Values = [
    ...new Set(variants.map((v) => v.option1Value).filter(Boolean)),
  ] as string[];
  const option2Values = [
    ...new Set(variants.map((v) => v.option2Value).filter(Boolean)),
  ] as string[];
  const option3Values = [
    ...new Set(variants.map((v) => v.option3Value).filter(Boolean)),
  ] as string[];

  return {
    option1: option1Name ? { name: option1Name, values: option1Values } : null,
    option2: option2Name ? { name: option2Name, values: option2Values } : null,
    option3: option3Name ? { name: option3Name, values: option3Values } : null,
  };
}

/**
 * Find variant by selected options
 */
export function findVariant(
  product: SerializedProduct,
  selections: {
    option1?: string;
    option2?: string;
    option3?: string;
  }
): ProductVariant | undefined {
  const variants = product.variants || [];

  return variants.find((v) => {
    if (selections.option1 && v.option1Value !== selections.option1) return false;
    if (selections.option2 && v.option2Value !== selections.option2) return false;
    if (selections.option3 && v.option3Value !== selections.option3) return false;
    return true;
  });
}

/**
 * Check if a variant combination is available
 */
export function isVariantAvailable(
  product: SerializedProduct,
  selections: {
    option1?: string;
    option2?: string;
    option3?: string;
  }
): boolean {
  const variant = findVariant(product, selections);
  if (!variant) return false;

  const available = variant.available ?? variant.inventory ?? 0;
  return variant.isAvailable !== false && available > 0;
}

// ============================================================================
// EXPORT
// ============================================================================

export const MetafieldResolver = {
  detectProductType,
  getProductTemplateVariant,
  parseMetafieldValue,
  flattenMetafields,
  getMetafieldValue,
  hasMetafieldValue,
  getFashionMetafields,
  getElectronicsMetafields,
  getVariantTitle,
  getProductOptions,
  findVariant,
  isVariantAvailable,
};

export default MetafieldResolver;
