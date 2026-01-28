/**
 * Template Engine - Shopify OS 2.0 Compatible Template Loading & Rendering
 *
 * This is the core engine that:
 * - Loads JSON template files
 * - Resolves section settings with defaults
 * - Handles metafield bindings
 * - Provides template data to components
 */

import type {
  TemplateJSON,
  TemplateType,
  SectionInstance,
  SectionContext,
  ThemeConfig,
  SerializedProduct,
  SerializedCollection,
  DynamicBinding,
  SectionSchema,
} from '../types';

// ============================================================================
// TEMPLATE LOADER
// ============================================================================

// Cache for loaded templates
const templateCache = new Map<string, TemplateJSON>();

/**
 * Load a template JSON file
 */
export async function loadTemplate(
  templateType: TemplateType,
  themeName: string = 'default'
): Promise<TemplateJSON> {
  const cacheKey = `${themeName}:${templateType}`;

  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey)!;
  }

  // Try loading the specific template, then fall back to default
  const templates = await import('../templates/default/index.json');

  // Map template types to files
  const templateMap: Record<string, () => Promise<TemplateJSON>> = {
    index: () =>
      import('../templates/default/index.json').then((m) => m.default as unknown as TemplateJSON),
    product: () =>
      import('../templates/default/product.json').then((m) => m.default as unknown as TemplateJSON),
    'product.fashion': () =>
      import('../templates/alternate/product.fashion.json').then(
        (m) => m.default as unknown as TemplateJSON
      ),
    'product.electronics': () =>
      import('../templates/alternate/product.electronics.json').then(
        (m) => m.default as unknown as TemplateJSON
      ),
    collection: () =>
      import('../templates/default/collection.json').then(
        (m) => m.default as unknown as TemplateJSON
      ),
    cart: () =>
      import('../templates/default/cart.json').then((m) => m.default as unknown as TemplateJSON),
  };

  try {
    const loader = templateMap[templateType];
    if (loader) {
      const template = await loader();
      templateCache.set(cacheKey, template);
      return template;
    }
  } catch (e) {
    console.warn(`Template ${templateType} not found, falling back to default`);
  }

  // Fallback to index template
  const fallback = await import('../templates/default/index.json');
  return fallback.default as unknown as TemplateJSON;
}

/**
 * Get template type from product metafields
 */
export function getProductTemplateType(product: SerializedProduct): TemplateType {
  // Check for template override in metafields
  const templateOverride = product.metafields?.template as string | undefined;
  if (templateOverride && isValidTemplateType(templateOverride)) {
    return templateOverride as TemplateType;
  }

  // Infer from category or tags
  const category = product.category?.toLowerCase() || '';
  const tags = product.tags?.map((t) => t.toLowerCase()) || [];

  // Fashion detection
  const fashionKeywords = [
    'clothing',
    'apparel',
    'fashion',
    'dress',
    'shirt',
    'pants',
    'shoes',
    'accessories',
    'jewelry',
  ];
  if (fashionKeywords.some((kw) => category.includes(kw) || tags.some((t) => t.includes(kw)))) {
    return 'product.fashion';
  }

  // Electronics detection
  const electronicsKeywords = [
    'electronics',
    'gadget',
    'phone',
    'laptop',
    'computer',
    'camera',
    'headphone',
    'speaker',
    'tv',
    'appliance',
  ];
  if (electronicsKeywords.some((kw) => category.includes(kw) || tags.some((t) => t.includes(kw)))) {
    return 'product.electronics';
  }

  return 'product';
}

function isValidTemplateType(type: string): boolean {
  const validTypes: TemplateType[] = [
    'index',
    'product',
    'product.fashion',
    'product.electronics',
    'collection',
    'collection.featured',
    'cart',
    'page',
    'page.about',
    'page.contact',
    'search',
    'blog',
    'article',
    'password',
    '404',
  ];
  return validTypes.includes(type as TemplateType);
}

// ============================================================================
// SETTINGS RESOLVER
// ============================================================================

/**
 * Resolve section settings with defaults and bindings
 */
export function resolveSectionSettings(
  section: SectionInstance,
  schema: SectionSchema,
  context: SectionContext
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};

  // Start with schema defaults
  for (const setting of schema.settings) {
    if (
      setting.default !== undefined &&
      setting.type !== 'header' &&
      setting.type !== 'paragraph'
    ) {
      resolved[setting.id] = setting.default;
    }
  }

  // Apply section instance settings
  for (const [key, value] of Object.entries(section.settings)) {
    // Check if value is a binding
    if (isBinding(value)) {
      const binding = (value as { '@bind': DynamicBinding })['@bind'];
      resolved[key] = resolveBinding(binding, context);
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
}

/**
 * Check if a value is a dynamic binding
 */
function isBinding(value: unknown): boolean {
  return typeof value === 'object' && value !== null && '@bind' in value;
}

/**
 * Resolve a dynamic binding to its value
 */
export function resolveBinding(binding: DynamicBinding, context: SectionContext): unknown {
  const { source, field, fallback } = binding;

  // Parse field path (e.g., 'metafields.custom.warranty' or 'title')
  const fieldPath = field.split('.');

  let data: unknown;

  switch (source) {
    case 'product':
      data = context.product;
      break;
    case 'collection':
      data = context.collection;
      break;
    case 'store':
      data = context.store;
      break;
    case 'cart':
      data = context.cart;
      break;
    case 'customer':
      data = context.customer;
      break;
    default:
      return fallback;
  }

  // Navigate the field path
  for (const part of fieldPath) {
    if (data === null || data === undefined) {
      return fallback;
    }
    data = (data as Record<string, unknown>)[part];
  }

  return data !== undefined ? data : fallback;
}

// ============================================================================
// METAFIELD HELPERS
// ============================================================================

/**
 * Get metafield value from an entity
 */
export function getMetafield(
  entity: { metafields?: Record<string, unknown> },
  namespace: string,
  key: string
): unknown {
  if (!entity.metafields) return undefined;

  // Check for namespaced key (e.g., 'custom.warranty')
  const fullKey = `${namespace}.${key}`;
  if (entity.metafields[fullKey] !== undefined) {
    return entity.metafields[fullKey];
  }

  // Check for nested structure
  const nsData = entity.metafields[namespace];
  if (typeof nsData === 'object' && nsData !== null) {
    return (nsData as Record<string, unknown>)[key];
  }

  return undefined;
}

/**
 * Check if a metafield exists and has a truthy value
 */
export function hasMetafield(
  entity: { metafields?: Record<string, unknown> },
  namespace: string,
  key: string
): boolean {
  const value = getMetafield(entity, namespace, key);
  return value !== undefined && value !== null && value !== '';
}

/**
 * Get all metafields for an entity
 */
export function getAllMetafields(entity: {
  metafields?: Record<string, unknown>;
}): Record<string, unknown> {
  return entity.metafields || {};
}

// ============================================================================
// SECTION VISIBILITY
// ============================================================================

/**
 * Check if a section should be visible based on conditions
 */
export function isSectionVisible(section: SectionInstance, context: SectionContext): boolean {
  // Check if explicitly disabled
  if (section.disabled) {
    return false;
  }

  // Check for conditional visibility
  const showFor = section.settings.show_for_metafield as string | undefined;
  if (showFor) {
    const [namespace, key] = showFor.split('.');
    if (!hasMetafield(context.product || {}, namespace, key)) {
      return false;
    }
  }

  // Check for product type visibility
  const showForTypes = section.settings.show_for_product_types as string[] | undefined;
  if (showForTypes && context.product) {
    const productType = context.product.metafields?.product_type as string;
    if (productType && !showForTypes.includes(productType)) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// TEMPLATE UTILITIES
// ============================================================================

/**
 * Get sections in order from template
 */
export function getOrderedSections(template: TemplateJSON): SectionInstance[] {
  return template.order.map((id) => template.sections[id]).filter(Boolean);
}

/**
 * Get sections by group (header, footer, body)
 */
export function getSectionsByGroup(
  template: TemplateJSON,
  group: 'header' | 'footer' | 'body'
): SectionInstance[] {
  const sections = getOrderedSections(template);

  switch (group) {
    case 'header':
      return sections.filter((s) => s.type === 'header' || s.type === 'announcement-bar');
    case 'footer':
      return sections.filter((s) => s.type === 'footer');
    case 'body':
      return sections.filter(
        (s) => s.type !== 'header' && s.type !== 'footer' && s.type !== 'announcement-bar'
      );
  }
}

/**
 * Merge store customizations with default template
 */
export function mergeTemplateCustomizations(
  defaultTemplate: TemplateJSON,
  customizations: Partial<TemplateJSON>
): TemplateJSON {
  const merged: TemplateJSON = {
    name: customizations.name || defaultTemplate.name,
    layout: customizations.layout || defaultTemplate.layout,
    wrapper: customizations.wrapper || defaultTemplate.wrapper,
    sections: { ...defaultTemplate.sections },
    order: customizations.order || defaultTemplate.order,
  };

  // Merge section settings
  if (customizations.sections) {
    for (const [id, section] of Object.entries(customizations.sections)) {
      if (merged.sections[id]) {
        merged.sections[id] = {
          ...merged.sections[id],
          ...section,
          settings: {
            ...merged.sections[id].settings,
            ...section.settings,
          },
        };
      } else {
        merged.sections[id] = section;
      }
    }
  }

  return merged;
}

// ============================================================================
// CONTEXT BUILDER
// ============================================================================

/**
 * Build section context from various sources
 */
export function buildSectionContext(params: {
  store: {
    id: number;
    name: string;
    logo?: string | null;
    currency: string;
    defaultLanguage?: 'en' | 'bn';
  };
  theme: ThemeConfig;
  pageType: string;
  pageHandle?: string;
  products?: SerializedProduct[];
  collections?: SerializedCollection[];
  product?: SerializedProduct;
  collection?: SerializedCollection;
  isPreview?: boolean;
  getLink: (path: string) => string;
  onNavigate?: (path: string) => void;
}): SectionContext {
  return {
    store: {
      id: params.store.id,
      name: params.store.name,
      logo: params.store.logo,
      currency: params.store.currency,
      defaultLanguage: params.store.defaultLanguage || 'en',
    },
    page: {
      type: params.pageType as SectionContext['page']['type'],
      handle: params.pageHandle,
    },
    theme: params.theme,
    products: params.products,
    collections: params.collections,
    product: params.product,
    collection: params.collection,
    isPreview: params.isPreview,
    getLink: params.getLink,
    onNavigate: params.onNavigate,
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export const TemplateEngine = {
  loadTemplate,
  getProductTemplateType,
  resolveSectionSettings,
  resolveBinding,
  getMetafield,
  hasMetafield,
  getAllMetafields,
  isSectionVisible,
  getOrderedSections,
  getSectionsByGroup,
  mergeTemplateCustomizations,
  buildSectionContext,
};

export default TemplateEngine;
