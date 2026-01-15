/**
 * AI Editable Utility
 * 
 * Used to bind an AI Schema to a Component.
 * In a real implementation, this could also register the component in a global registry.
 */

export interface AISchema {
    component: string;
    version: string;
    properties: Record<string, any>;
    actions?: string[];
    conditions?: Record<string, any>;
}

// Registry to store schemas at runtime if needed
export const AI_COMPONENT_REGISTRY: Record<string, AISchema> = {};

/**
 * Attaches an AI Schema to a component class or function.
 * 
 * Usage:
 * export const HeroSection = withAISchema(HeroSectionComponent, HERO_SCHEMA);
 */
export function withAISchema<T extends object>(Component: T, schema: AISchema): T {
    // Attach schema as a static property
    (Component as any).aiSchema = schema;
    
    // Register in global registry
    AI_COMPONENT_REGISTRY[schema.component] = schema;

    return Component;
}

/**
 * Helper to retrieve schema from a component
 */
export function getAISchema(Component: any): AISchema | undefined {
    return Component.aiSchema;
}
