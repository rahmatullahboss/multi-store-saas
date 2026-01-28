/**
 * Theme Engine - Shopify OS 2.0 Compatible Theme System
 *
 * This module provides a complete theme system for the Multi Store SaaS platform
 * that follows Shopify's Online Store 2.0 architecture:
 *
 * - JSON-based templates for all page types
 * - Section schemas with settings and blocks
 * - Dynamic data bindings (metafields)
 * - Template inheritance and overrides
 * - Variant-aware section rendering
 *
 * Usage:
 * ```tsx
 * import { PageRenderer, loadTemplate, SECTION_SCHEMAS } from '~/lib/theme-engine';
 *
 * const template = await loadTemplate('product');
 *
 * <PageRenderer
 *   template={template}
 *   registry={sectionRegistry}
 *   store={store}
 *   theme={theme}
 *   pageType="product"
 *   product={product}
 * />
 * ```
 */

// Core Types
export type {
  // Setting types
  SettingType,
  SettingDefinition,

  // Block types
  BlockDefinition,
  BlockInstance,

  // Section types
  PageType,
  SectionGroup,
  SectionSchema,
  SectionPreset,
  SectionInstance,
  RegisteredSection,
  SectionComponentProps,
  BlockComponentProps,
  SectionContext,

  // Template types
  TemplateJSON,
  TemplateType,

  // Theme types
  ThemeSettingsSchema,
  ThemeConfig,

  // Data types
  SerializedProduct,
  ProductVariant,
  SerializedCollection,
  CartData,
  CartItem,
  CartDiscount,
  CustomerData,

  // Binding types
  DynamicBinding,
  BoundSetting,

  // Registry types
  SectionRegistry,
  TemplateRegistry,

  // Utility types
  SettingValue,
  DeepPartial,
  RequireKeys,
} from './types';

// Section Schemas
export {
  // Common settings groups
  PADDING_SETTINGS,
  COLOR_SETTINGS,
  HEADING_SETTINGS,
  BUTTON_SETTINGS,

  // Section schemas
  HERO_SECTION_SCHEMA,
  PRODUCT_GRID_SECTION_SCHEMA,
  FEATURED_COLLECTION_SECTION_SCHEMA,
  COLLECTION_LIST_SECTION_SCHEMA,
  RICH_TEXT_SECTION_SCHEMA,
  IMAGE_WITH_TEXT_SECTION_SCHEMA,
  NEWSLETTER_SECTION_SCHEMA,
  TESTIMONIALS_SECTION_SCHEMA,
  FAQ_SECTION_SCHEMA,
  PRODUCT_INFO_SECTION_SCHEMA,
  RELATED_PRODUCTS_SECTION_SCHEMA,
  CART_ITEMS_SECTION_SCHEMA,
  CART_FOOTER_SECTION_SCHEMA,

  // Schema registry
  SECTION_SCHEMAS,
} from './schemas/section-schemas';

// Template Engine utilities
export {
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
  TemplateEngine,
} from './utils/template-engine';

// Page Renderer components
export {
  SectionRenderer,
  PageRenderer,
  LazyPageRenderer,
  useSectionContext,
  useSetting,
} from './utils/page-renderer';

// Metafield Resolver
export {
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
  MetafieldResolver,
  PRODUCT_METAFIELD_NAMESPACES,
  FASHION_METAFIELDS,
  ELECTRONICS_METAFIELDS,
} from './utils/metafield-resolver';

export type {
  MetafieldType as ThemeMetafieldType,
  MetafieldOwnerType,
  MetafieldValue,
  ResolvedMetafields,
  ProductTypeCategory,
} from './utils/metafield-resolver';

// Section Registry Adapter
export {
  buildSectionRegistry,
  getSectionRegistry,
  registerSection,
  getSection,
  getAllSectionTypes,
  getSectionsForPage,
  SectionRegistryAdapter,
} from './utils/section-registry-adapter';

// Database Integration
export {
  loadTemplateFromDB,
  loadThemeSettingsFromDB,
  saveTemplateDraft,
  publishTemplate,
  pageTypeToTemplateKey,
  templateKeyToPageType,
  loadCombinedTemplate,
  ThemeEngineDB,
} from './db-integration';

// Theme Config Converter (Phase 1 - Template Migration)
export {
  convertToThemeConfig,
  convertTemplateToThemeConfig,
  convertToStoreTemplateTheme,
  themeConfigToCSSVariables,
  createThemeStyles,
  isDarkColor,
  getContrastingColor,
  getGoogleFontsUrl,
  getFontLinkProps,
  TEMPLATE_THEME_CONFIGS,
  getThemeConfigForTemplate,
  getAvailableTemplates,
} from './utils/theme-config-converter';

// Template Factory (Phase 1 - Template Migration)
export {
  createTemplate,
  createTemplateFromDefinition,
  createTemplateById,
  TEMPLATE_COMPONENTS,
  initializeTemplateComponents,
  getTemplateComponent,
  createHybridTemplate,
  isNewThemeEngineEnabled,
  getTemplateInfo,
  listTemplates,
} from './utils/template-factory';

export type {
  TemplateFactoryConfig,
  TemplateComponent,
  HybridTemplateOptions,
} from './utils/template-factory';

// Base Template Component (Phase 1 - Template Migration)
export { BaseTemplate, PreviewWrapper } from './components/BaseTemplate';
export type { BaseTemplateProps } from './components/BaseTemplate';

// Re-export default
export { TemplateEngine as default } from './utils/template-engine';

// Theme Bridge (Shopify OS 2.0 Theme Integration)
export { ThemeBridge, getThemeBridge, resetThemeBridge } from './ThemeBridge';

export type { ThemeMetadata, LoadedTheme, EditorSection } from './ThemeBridge';
