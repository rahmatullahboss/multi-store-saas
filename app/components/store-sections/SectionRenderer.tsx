
import React from 'react';
import { SECTION_REGISTRY } from './registry';

// Default theme fallback to prevent undefined errors
const DEFAULT_THEME = {
  primary: '#1a1a1a',
  accent: '#f59e0b',
  background: '#ffffff',
  text: '#1a1a1a',
  muted: '#6b7280',
  cardBg: '#ffffff',
  headerBg: '#ffffff',
  footerBg: '#1a1a1a',
  footerText: '#ffffff',
};

interface SectionRendererProps {
  sections: any[];
  theme?: any;
  storeId?: number;
  products?: any[];
  categories?: string[];
  currentCategory?: string;
  currency?: string;
  // Page specific data
  product?: any;
  storeName?: string;
  reviews?: any[];
  showReviews?: boolean;
  logo?: string;
  socialLinks?: any;
  businessInfo?: any;
}


export function SectionRenderer(props: SectionRendererProps) {
  const { sections, theme, ...restProps } = props;
  
  // Ensure theme is always defined to prevent undefined errors in sections
  const passThroughProps = {
    ...restProps,
    theme: theme || DEFAULT_THEME,
  };

  if (!sections || !Array.isArray(sections)) {
    return null;
  }

  return (
    <>
      {sections.map((section: any) => {
        const definition = SECTION_REGISTRY[section.type];
        if (!definition) {
          console.warn(`Section type "${section.type}" not found in registry.`);
          return null;
        }

        const SectionComponent = definition.component;
        
      // APPLY DATA BINDINGS (Metafields)
      // Check if this section has bindings and hydrate the settings
      const hydratedSettings = { ...section.settings };
      
      if (hydratedSettings.bindings) {
        Object.entries(hydratedSettings.bindings).forEach(([settingKey, binding]: [string, any]) => {
          if (binding && binding.source && binding.field) {
            // Try to find the value in props
            // e.g. source='product', field='title' -> look in passThroughProps.product.title
            
            // @ts-expect-error - dynamic access
            const sourceObject = passThroughProps[binding.source];
            
            if (sourceObject) {
              // Handle deep access if needed, for now flat access
              const dynamicValue = sourceObject[binding.field];
              
              if (dynamicValue !== undefined && dynamicValue !== null) {
                // Formatting for specific types (like Price) could happen here,
                // but usually the raw value is text or number, which fits most settings.
                // Special case: Price usually needs formatting if it's a number being injected into a text field.
                if (binding.field.toLowerCase().includes('price') && typeof dynamicValue === 'number') {
                   // If we had access to a formatter here we would use it.
                   // For now, let's just use the raw value, the component might handle it 
                   // or we rely on the component using the raw number if the setting expects a number.
                   // If the setting expects a string, we stringify.
                   hydratedSettings[settingKey] = dynamicValue.toString();
                } else {
                   hydratedSettings[settingKey] = dynamicValue;
                }
              }
            }
          }
        });
      }

      return (
        <SectionComponent 
          key={section.id} 
          settings={hydratedSettings} 
          {...passThroughProps} 
        />
      );
      })}
    </>
  );
}
