/**
 * Action Validator Service
 * 
 * Validates AI responses to ensure they only perform
 * allowed actions on the selected element.
 */

import type { 
  AIResponse, 
  AIAction, 
  AllowedAction, 
  ValidationResult 
} from '../types';
import { ALLOWED_ACTIONS, FORBIDDEN_STYLE_PROPERTIES } from '../types';

export class ActionValidator {
  private selectedComponentId: string;
  
  constructor(selectedComponentId: string) {
    this.selectedComponentId = selectedComponentId;
  }

  /**
   * Validate entire AI response
   */
  validate(response: AIResponse): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!response.actions || response.actions.length === 0) {
      return {
        valid: false,
        errors: ['No actions provided in response'],
        warnings: [],
        sanitizedResponse: null,
      };
    }

    const sanitizedActions: AIAction[] = [];

    for (const action of response.actions) {
      const actionResult = this.validateAction(action);
      
      if (!actionResult.valid) {
        errors.push(...actionResult.errors);
      } else if (actionResult.sanitizedAction) {
        sanitizedActions.push(actionResult.sanitizedAction);
      }
      
      warnings.push(...actionResult.warnings);
    }

    return {
      valid: errors.length === 0 && sanitizedActions.length > 0,
      errors,
      warnings,
      sanitizedResponse: errors.length === 0 ? {
        ...response,
        actions: sanitizedActions,
      } : null,
    };
  }

  /**
   * Validate individual action
   */
  private validateAction(action: AIAction): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    sanitizedAction: AIAction | null;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check 1: Action type is allowed
    if (!ALLOWED_ACTIONS.includes(action.action)) {
      errors.push(`Forbidden action type: ${action.action}`);
    }

    // Check 2: Target ID matches selected component
    if (action.targetId !== this.selectedComponentId) {
      // Auto-fix by forcing correct target ID
      warnings.push(`Corrected target ID from ${action.targetId} to ${this.selectedComponentId}`);
      action.targetId = this.selectedComponentId;
    }

    // Check 3: Remove forbidden style properties
    if (action.changes?.styles) {
      for (const prop of FORBIDDEN_STYLE_PROPERTIES) {
        if (prop in action.changes.styles) {
          warnings.push(`Removed forbidden style property: ${prop}`);
          delete action.changes.styles[prop];
        }
      }
    }

    // Check 4: Sanitize content (remove scripts)
    if (action.changes?.content) {
      const sanitizedContent = this.sanitizeContent(action.changes.content);
      if (sanitizedContent !== action.changes.content) {
        warnings.push('Content was sanitized for security');
        action.changes.content = sanitizedContent;
      }
    }

    // Check 5: Validate URLs
    if (action.action === 'updateSrc' || action.action === 'updateHref') {
      const url = action.changes?.attributes?.src || action.changes?.attributes?.href;
      if (url && !this.isValidUrl(url)) {
        errors.push(`Invalid URL: ${url}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      sanitizedAction: errors.length === 0 ? action : null,
    };
  }

  /**
   * Sanitize HTML content to remove dangerous elements
   */
  private sanitizeContent(content: string): string {
    // Remove script tags
    let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/\s*on\w+="[^"]*"/gi, '');
    sanitized = sanitized.replace(/\s*on\w+='[^']*'/gi, '');
    
    // Remove javascript: URLs
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
    
    return sanitized;
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    // Allow relative URLs
    if (url.startsWith('/') || url.startsWith('#') || url.startsWith('./')) {
      return true;
    }
    
    // Check absolute URLs
    try {
      const parsed = new URL(url);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
}

/**
 * Create an ActionValidator instance
 */
export function createActionValidator(selectedComponentId: string): ActionValidator {
  return new ActionValidator(selectedComponentId);
}
