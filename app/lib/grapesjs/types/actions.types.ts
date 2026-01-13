/**
 * Action Types for GrapeJS AI Integration
 * 
 * Defines allowed/forbidden actions and
 * the structure of AI responses.
 */

/**
 * Actions that AI can perform on selected elements
 * These are SAFE operations that only modify the selected element
 */
export type AllowedAction = 
  | 'updateContent'      // Change text/innerHTML
  | 'updateStyles'       // Modify CSS styles
  | 'updateAttributes'   // Change HTML attributes
  | 'addClass'           // Add CSS class
  | 'removeClass'        // Remove CSS class
  | 'updateSrc'          // Change image/video source
  | 'updateHref'         // Change link destination
  | 'updateAlt';         // Change alt text

/**
 * Actions that AI is FORBIDDEN from performing
 * These would affect other elements or destroy structure
 */
export type ForbiddenAction =
  | 'deleteElement'      // Cannot delete selected element
  | 'createSection'      // Cannot create new sections
  | 'moveElement'        // Cannot move element to different parent
  | 'replaceElement'     // Cannot replace with new element
  | 'modifyParent'       // Cannot touch parent element
  | 'modifySibling'      // Cannot touch sibling elements
  | 'createNewElement';  // Cannot add new elements

/**
 * List of allowed actions for validation
 */
export const ALLOWED_ACTIONS: AllowedAction[] = [
  'updateContent',
  'updateStyles',
  'updateAttributes',
  'addClass',
  'removeClass',
  'updateSrc',
  'updateHref',
  'updateAlt',
];

/**
 * Style properties that should not be modified
 * (could break layout or visibility)
 */
export const FORBIDDEN_STYLE_PROPERTIES = [
  'position',    // Don't allow position changes
  'z-index',     // Don't allow z-index changes
  'display',     // Don't allow display changes that could hide element
];

/**
 * Single action to be executed on a component
 */
export interface AIAction {
  /** Type of action to perform */
  action: AllowedAction;
  
  /** Target component ID (must match selected component) */
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
 * Complete response from AI
 */
export interface AIResponse {
  /** Whether the request was successful */
  success: boolean;
  
  /** List of actions to execute (usually just one) */
  actions: AIAction[];
  
  /** Human-readable explanation (in Bengali or English) */
  explanation: string;
  
  /** If AI needs more info from user */
  needsUserInput?: boolean;
  
  /** Prompt to show user if needsUserInput is true */
  prompt?: string;
  
  /** Error message if failed */
  error?: string;
}

/**
 * Result of executing a single action
 */
export interface ActionResult {
  action: AIAction;
  success: boolean;
  error?: string;
}

/**
 * Result of executing all actions
 */
export interface ExecutionResult {
  success: boolean;
  results: ActionResult[];
  canUndo: boolean;
}

/**
 * Result of validating AI response
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedResponse: AIResponse | null;
}
