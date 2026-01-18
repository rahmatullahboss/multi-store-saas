/**
 * AI Action Types
 * 
 * Defines allowed/forbidden actions and AI response structure
 * for strict element targeting.
 */

import type { ComponentType } from './editor.types';

/**
 * Actions that AI is allowed to perform
 */
export type AllowedAction =
  | 'updateContent'
  | 'updateStyles'
  | 'updateAttributes'
  | 'addClass'
  | 'removeClass'
  | 'updateSrc'
  | 'updateHref'
  | 'updateAlt';

/**
 * Actions that AI must NEVER perform
 */
export type ForbiddenAction =
  | 'deleteElement'
  | 'createSection'
  | 'moveElement'
  | 'replaceElement'
  | 'modifyParent'
  | 'modifySibling'
  | 'createNewElement';

/**
 * Single action from AI response
 */
export interface AIAction {
  /** Action type - must be AllowedAction */
  action: AllowedAction;
  
  /** Target component ID - must match selected component */
  targetId: string;
  
  /** Changes to apply */
  changes: {
    content?: string;
    styles?: Record<string, string>;
    attributes?: Record<string, string>;
    addClass?: string[];
    removeClass?: string[];
  };
}

/**
 * Complete AI response with one or more actions
 */
export interface AIResponse {
  /** Whether the AI understood the request */
  success: boolean;
  
  /** Array of actions to perform */
  actions: AIAction[];
  
  /** Human-readable explanation */
  explanation: string;
  
  /** If AI needs more info from user */
  needsUserInput?: boolean;
  
  /** Follow-up prompt if needsUserInput */
  prompt?: string;
  
  /** Error message if failed */
  error?: string;
}

/**
 * Result of validating AI response
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedResponse?: AIResponse;
}

/**
 * Result of executing AI actions
 */
export interface ExecutionResult {
  success: boolean;
  results: ActionResult[];
}

/**
 * Result of a single action execution
 */
export interface ActionResult {
  action: AIAction;
  success: boolean;
  error?: string;
}
