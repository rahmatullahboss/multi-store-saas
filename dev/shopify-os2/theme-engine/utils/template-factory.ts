/**
 * Template Factory
 *
 * Creates template components from theme configurations.
 * This is the core of the theme engine migration - allowing all 16 templates
 * to share the same rendering logic while keeping their unique visual identity.
 *
 * Benefits:
 * 1. Single source of truth for page rendering logic
 * 2. Easy to add new templates (just add theme config)
 * 3. Consistent behavior across all templates
 * 4. Backwards compatible with existing template system
 *
 * Usage:
 * ```tsx
 * // Create a template component from an existing template definition
 * const NovaLuxV2 = createTemplateFromDefinition(
 *   STORE_TEMPLATES.find(t => t.id === 'nova-lux')!
 * );
 *
 * // Or create from a custom theme config
 * const CustomTemplate = createTemplate({
 *   templateId: 'custom',
 *   themeConfig: myThemeConfig,
 *   Header: CustomHeader,
 *   Footer: CustomFooter,
 * });
 * ```
 */

import React, { createElement, type ComponentType } from 'react';
import type { ThemeConfig } from '../types';
import type {
  StoreTemplateProps,
  StoreTemplateDefinition,
  StoreHeaderProps,
  StoreFooterProps,
} from '~/templates/store-registry';
import { BaseTemplate } from '../components/BaseTemplate';
import { convertTemplateToThemeConfig, getThemeConfigForTemplate } from './theme-config-converter';

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateFactoryConfig {
  /**
   * Unique template identifier
   */
  templateId: string;

  /**
   * Theme configuration
   */
  themeConfig: ThemeConfig;

  /**
   * Header component
   */
  Header?: ComponentType<StoreHeaderProps>;

  /**
   * Footer component
   */
  Footer?: ComponentType<StoreFooterProps>;

  /**
   * Optional custom ProductCard component
   */
  ProductCard?: ComponentType<unknown>;

  /**
   * Additional class name for the container
   */
  className?: string;
}

export interface TemplateComponent {
  /**
   * The actual React component
   */
  Component: ComponentType<StoreTemplateProps>;

  /**
   * Template identifier
   */
  templateId: string;

  /**
   * Theme configuration
   */
  themeConfig: ThemeConfig;
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a template component from configuration
 *
 * This is the main factory function that creates a fully functional
 * template component from a theme configuration.
 */
export function createTemplate(config: TemplateFactoryConfig): TemplateComponent {
  const { templateId, themeConfig, Header, Footer, ProductCard, className } = config;

  // Create the component using createElement to avoid JSX issues
  const Component: ComponentType<StoreTemplateProps> = function TemplateWrapper(
    props: StoreTemplateProps
  ) {
    return createElement(BaseTemplate, {
      ...props,
      templateId,
      themeConfig,
      Header,
      Footer,
      ProductCard,
      className,
    });
  };

  // Set display name for debugging
  Component.displayName = `Template(${templateId})`;

  return {
    Component,
    templateId,
    themeConfig,
  };
}

/**
 * Create a template from an existing StoreTemplateDefinition
 *
 * This allows easy migration of existing templates to the new system
 * while preserving their original Header/Footer components.
 */
export function createTemplateFromDefinition(
  definition: StoreTemplateDefinition
): TemplateComponent {
  const themeConfig = convertTemplateToThemeConfig(definition);

  return createTemplate({
    templateId: definition.id,
    themeConfig,
    Header: definition.Header as ComponentType<StoreHeaderProps> | undefined,
    Footer: definition.Footer as ComponentType<StoreFooterProps> | undefined,
  });
}

/**
 * Create a template from just a template ID
 *
 * Looks up the template definition and creates the component.
 * Useful when you just know the template ID.
 */
export function createTemplateById(
  templateId: string,
  options?: {
    Header?: ComponentType<StoreHeaderProps>;
    Footer?: ComponentType<StoreFooterProps>;
    ProductCard?: ComponentType<unknown>;
  }
): TemplateComponent {
  const themeConfig = getThemeConfigForTemplate(templateId);

  return createTemplate({
    templateId,
    themeConfig,
    ...options,
  });
}

// ============================================================================
// TEMPLATE REGISTRY BUILDER
// ============================================================================

import { STORE_TEMPLATES } from '~/templates/store-registry';

/**
 * Pre-built template components for all registered templates
 *
 * This creates a mapping of template ID -> TemplateComponent
 * for quick access without re-creating components.
 */
export const TEMPLATE_COMPONENTS: Record<string, TemplateComponent> = {};

/**
 * Initialize all template components
 *
 * Call this once at startup to pre-create all template components.
 */
export function initializeTemplateComponents(): void {
  for (const definition of STORE_TEMPLATES) {
    TEMPLATE_COMPONENTS[definition.id] = createTemplateFromDefinition(definition);
  }
}

/**
 * Get a template component by ID
 *
 * Returns the pre-built component if available, otherwise creates one.
 */
export function getTemplateComponent(templateId: string): TemplateComponent {
  if (TEMPLATE_COMPONENTS[templateId]) {
    return TEMPLATE_COMPONENTS[templateId];
  }

  // Create on-demand if not pre-built
  const template = createTemplateById(templateId);
  TEMPLATE_COMPONENTS[templateId] = template;
  return template;
}

// ============================================================================
// HYBRID TEMPLATE (Supports both old and new modes)
// ============================================================================

export interface HybridTemplateOptions {
  /**
   * Template ID
   */
  templateId: string;

  /**
   * Original template component (old system)
   */
  LegacyComponent: ComponentType<StoreTemplateProps>;

  /**
   * Header component
   */
  Header?: ComponentType<StoreHeaderProps>;

  /**
   * Footer component
   */
  Footer?: ComponentType<StoreFooterProps>;

  /**
   * ProductCard component
   */
  ProductCard?: ComponentType<unknown>;

  /**
   * When to use the new system
   * - 'always': Always use new BaseTemplate
   * - 'never': Always use legacy component
   * - 'when-enabled': Use new system when store has it enabled
   */
  mode?: 'always' | 'never' | 'when-enabled';
}

/**
 * Create a hybrid template that can switch between old and new systems
 *
 * This is useful during migration - stores can gradually opt-in to the new system.
 */
export function createHybridTemplate(
  options: HybridTemplateOptions
): ComponentType<StoreTemplateProps> {
  const {
    templateId,
    LegacyComponent,
    Header,
    Footer,
    ProductCard,
    mode = 'when-enabled',
  } = options;

  const themeConfig = getThemeConfigForTemplate(templateId);

  const HybridTemplate: ComponentType<StoreTemplateProps> = function HybridTemplateWrapper(
    props: StoreTemplateProps
  ) {
    // Determine which system to use
    const configWithEngine = props.config as { useNewThemeEngine?: boolean } | null;
    const useNewSystem =
      mode === 'always' || (mode === 'when-enabled' && configWithEngine?.useNewThemeEngine);

    if (useNewSystem) {
      return createElement(BaseTemplate, {
        ...props,
        templateId,
        themeConfig,
        Header,
        Footer,
        ProductCard,
      });
    }

    // Fall back to legacy component
    return createElement(LegacyComponent, props);
  };

  HybridTemplate.displayName = `HybridTemplate(${templateId})`;

  return HybridTemplate;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a template uses the new theme engine
 */
export function isNewThemeEngineEnabled(config: StoreTemplateProps['config']): boolean {
  const configWithEngine = config as { useNewThemeEngine?: boolean } | null;
  return Boolean(configWithEngine?.useNewThemeEngine);
}

/**
 * Get template display info
 */
export function getTemplateInfo(templateId: string): {
  id: string;
  name: string;
  description: string;
  category: string;
  fonts: { heading: string; body: string };
} | null {
  const definition = STORE_TEMPLATES.find((t) => t.id === templateId);
  if (!definition) return null;

  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    fonts: definition.fonts,
  };
}

/**
 * List all available templates with their info
 */
export function listTemplates(): Array<{
  id: string;
  name: string;
  category: string;
}> {
  return STORE_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
  }));
}
