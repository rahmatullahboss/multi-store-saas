export interface AIAction {
  type: string; // "update_section" | "remove_section" | "add_section" | "reorder_sections"
  sectionId?: string;
  updates?: Record<string, any>;
  confidence: number;
}

export interface AISchema {
  component: string;
  properties: Record<string, any>;
  actions?: string[];
}

export interface ValidationResult {
  valid: boolean;
  sanitizedAction?: AIAction;
  errors?: string[];
}

// Helper for recursive validation
function validateProperty(key: string, value: any, propSchema: any, errors: string[]) {
  // A. Schema Existence
  if (!propSchema) return;

  // B. Editable Flag
  // if (propSchema.aiEditable === false) { ... }

  // C. Type Safety
  if (propSchema.type === 'string' && typeof value !== 'string') {
    errors.push(`Property '${key}' must be a string.`);
    return;
  }
  if (propSchema.type === 'number' && typeof value !== 'number') {
    errors.push(`Property '${key}' must be a number.`);
    return;
  }
  if (propSchema.type === 'boolean' && typeof value !== 'boolean') {
    errors.push(`Property '${key}' must be a boolean.`);
    return;
  }
  if (propSchema.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(`Property '${key}' must be an array.`);
      return;
    }
    // Validate array items if schema defines `items`
    if (propSchema.items) {
      value.forEach((item, index) => {
        validateProperty(`${key}[${index}]`, item, propSchema.items, errors);
      });
    }
    return;
  }
  if (propSchema.type === 'object') {
    if (typeof value !== 'object' || value === null) {
      errors.push(`Property '${key}' must be an object.`);
      return;
    }
    // Validate nested properties if schema defines `properties`
    if (propSchema.properties) {
      for (const [subKey, subValue] of Object.entries(value)) {
        const subSchema = propSchema.properties[subKey];
        if (subSchema) {
          validateProperty(`${key}.${subKey}`, subValue, subSchema, errors);
        }
      }
    }
    return;
  }

  // D. Constraints: Max Length
  if (propSchema.type === 'string' && propSchema.maxLength && (value as string).length > propSchema.maxLength) {
    errors.push(`Property '${key}' exceeds max length of ${propSchema.maxLength}.`);
  }

  // E. Security: XSS Check
  if (typeof value === 'string' && (value.includes('<script>') || value.includes('javascript:'))) {
     errors.push(`Malicious content detected in '${key}'.`);
  }
  
  // F. Enum Validation
  if (propSchema.aiEnum && !propSchema.aiEnum.includes(value)) {
      errors.push(`Value '${value}' for '${key}' is not in allowed list.`);
  }
  
  // G. Constraints: Min/Max for numbers
  if (propSchema.type === 'number') {
      if (propSchema.min !== undefined && value < propSchema.min) errors.push(`Property '${key}' must be >= ${propSchema.min}.`);
      if (propSchema.max !== undefined && value > propSchema.max) errors.push(`Property '${key}' must be <= ${propSchema.max}.`);
  }
}

/**
 * Validates an AI-generated action against the component schema and security rules.
 */
export async function validateAIAction(
  action: AIAction, 
  schema: AISchema,
): Promise<ValidationResult> {
  const errors: string[] = [];

  // 1. Confidence Check
  if (action.confidence < 0.7) {
    return { valid: false, errors: ["Low confidence score. Manual review required."] };
  }

  // 2. Action Type Check
  if (schema.actions && !schema.actions.includes(action.type.split('_')[0])) {
      // Check logic here if strict action validation is needed
  }

  // 3. Recursive Property Validation (for updates)
  if (action.type === "update_section" && action.updates) {
    for (const [key, value] of Object.entries(action.updates)) {
      const propSchema = schema.properties?.[key];

      // A. Schema Existence
      if (!propSchema) {
        errors.push(`Property '${key}' is not editable or does not exist in schema.`);
        continue;
      }

      validateProperty(key, value, propSchema, errors);
    }
  }

  return errors.length === 0
    ? { valid: true, sanitizedAction: action }
    : { valid: false, errors };
}
