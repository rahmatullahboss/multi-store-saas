/**
 * Action Validator Service
 * 
 * Validates AI responses to ensure only allowed actions
 * targeting the selected component are executed.
 */

import type { 
  AIResponse, 
  AIAction, 
  AllowedAction, 
  ValidationResult 
} from '../types';

/**
 * Allowed action types that AI can perform
 */
const ALLOWED_ACTIONS: AllowedAction[] = [
  'updateContent',
  'updateStyles',
  'updateAttributes',
  'addClass',
  'removeClass',
  'updateSrc',
  'updateHref',
  'updateAlt',
];

export class ActionValidator {
  private selectedComponentId: string;

  constructor(selectedComponentId: string) {
    this.selectedComponentId = selectedComponentId;
  }

  /**
   * Validate AI response
   * - Checks all actions are allowed types
   * - Checks all actions target the selected component
   */
  validate(response: AIResponse): ValidationResult {
    const errors: string[] = [];
    const sanitizedActions: AIAction[] = [];

    if (!response.actions || !Array.isArray(response.actions)) {
      return {
        valid: false,
        errors: ['No actions in response'],
      };
    }

    for (const action of response.actions) {
      // Check 1: Action type is allowed
      if (!ALLOWED_ACTIONS.includes(action.action)) {
        errors.push(`❌ নিষিদ্ধ action: ${action.action}`);
        continue;
      }

      // Check 2: Target ID matches selected component
      if (action.targetId !== this.selectedComponentId) {
        errors.push(`❌ ভুল target: ${action.targetId} (expected: ${this.selectedComponentId})`);
        continue;
      }

      // Check 3: Changes object exists
      if (!action.changes || typeof action.changes !== 'object') {
        errors.push(`❌ Invalid changes object`);
        continue;
      }

      sanitizedActions.push(action);
    }

    return {
      valid: errors.length === 0 && sanitizedActions.length > 0,
      errors,
      sanitizedResponse: {
        ...response,
        actions: sanitizedActions,
      },
    };
  }

  /**
   * Check if an action type is allowed
   */
  static isAllowedAction(action: string): action is AllowedAction {
    return ALLOWED_ACTIONS.includes(action as AllowedAction);
  }

  /**
   * Get list of forbidden actions for error messages
   */
  static getForbiddenActions(): string[] {
    return [
      'deleteElement',
      'createSection',
      'moveElement',
      'replaceElement',
      'modifyParent',
      'modifySibling',
      'createNewElement',
    ];
  }
}
