/**
 * Action Executor Service
 * 
 * Safely applies AI actions to GrapeJS components
 * with undo support.
 */

import type { 
  AIResponse, 
  AIAction, 
  ExecutionResult, 
  ActionResult,
  ComponentState,
  UndoItem
} from '../types';
import { ContextBuilder } from './contextBuilder';

export class ActionExecutor {
  private editor: any;
  private undoStack: UndoItem[] = [];
  private contextBuilder: ContextBuilder;

  constructor(editor: any) {
    this.editor = editor;
    this.contextBuilder = new ContextBuilder(editor);
  }

  /**
   * Execute all actions in AI response
   */
  async execute(response: AIResponse): Promise<ExecutionResult> {
    const results: ActionResult[] = [];

    for (const action of response.actions) {
      const component = this.getComponent(action.targetId);
      
      if (!component) {
        results.push({ 
          action, 
          success: false, 
          error: `Component not found: ${action.targetId}` 
        });
        continue;
      }

      // Capture state before change for undo
      const previousState = this.contextBuilder.captureState(component);
      this.undoStack.push({
        componentId: action.targetId,
        state: previousState,
        timestamp: new Date(),
      });

      try {
        await this.executeAction(component, action);
        results.push({ action, success: true });
      } catch (error) {
        results.push({ 
          action, 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    return {
      success: results.every(r => r.success),
      results,
    };
  }

  /**
   * Execute a single action on component
   */
  private async executeAction(component: any, action: AIAction): Promise<void> {
    switch (action.action) {
      case 'updateContent':
        if (action.changes.content !== undefined) {
          component.set('content', action.changes.content);
        }
        break;

      case 'updateStyles':
        if (action.changes.styles) {
          const currentStyles = component.getStyle() || {};
          component.setStyle({
            ...currentStyles,
            ...action.changes.styles,
          });
        }
        break;

      case 'updateAttributes':
        if (action.changes.attributes) {
          const currentAttrs = component.getAttributes() || {};
          component.setAttributes({
            ...currentAttrs,
            ...action.changes.attributes,
          });
        }
        break;

      case 'addClass':
        if (action.changes.addClass) {
          action.changes.addClass.forEach(className => {
            component.addClass(className);
          });
        }
        break;

      case 'removeClass':
        if (action.changes.removeClass) {
          action.changes.removeClass.forEach(className => {
            component.removeClass(className);
          });
        }
        break;

      case 'updateSrc':
        if (action.changes.attributes?.src) {
          component.set('src', action.changes.attributes.src);
          component.addAttributes({ src: action.changes.attributes.src });
        }
        break;

      case 'updateHref':
        if (action.changes.attributes?.href) {
          component.addAttributes({ href: action.changes.attributes.href });
        }
        break;

      case 'updateAlt':
        if (action.changes.attributes?.alt) {
          component.addAttributes({ alt: action.changes.attributes.alt });
        }
        break;

      default:
        throw new Error(`Unknown action type: ${action.action}`);
    }
  }

  /**
   * Get component by ID from editor
   */
  private getComponent(id: string): any {
    const wrapper = this.editor.DomComponents?.getWrapper?.();
    if (!wrapper) return null;

    // Try to find by ID
    const found = wrapper.find(`#${id}`);
    if (found && found.length > 0) return found[0];

    // Try to find by data-gjs-id
    const foundByData = wrapper.find(`[data-gjs-id="${id}"]`);
    if (foundByData && foundByData.length > 0) return foundByData[0];

    // Search recursively by component ID
    return this.findComponentById(wrapper, id);
  }

  /**
   * Recursively find component by ID
   */
  private findComponentById(component: any, id: string): any {
    if (component.getId?.() === id || component.cid === id) {
      return component;
    }

    const children = component.components?.();
    if (!children) return null;

    for (let i = 0; i < children.length; i++) {
      const child = children.at(i);
      const found = this.findComponentById(child, id);
      if (found) return found;
    }

    return null;
  }

  /**
   * Undo last action
   */
  undo(): boolean {
    const lastUndo = this.undoStack.pop();
    if (!lastUndo) return false;

    const component = this.getComponent(lastUndo.componentId);
    if (!component) return false;

    // Restore previous state
    component.set('content', lastUndo.state.content);
    component.setStyle(lastUndo.state.styles);
    component.setAttributes(lastUndo.state.attributes);
    
    // Restore classes
    const currentClasses = component.getClasses() || [];
    currentClasses.forEach((c: any) => component.removeClass(c.id || c));
    lastUndo.state.classes.forEach((c: string) => component.addClass(c));

    return true;
  }

  /**
   * Undo to a specific point in history
   */
  undoToPoint(targetUndoCount: number): number {
    let undoneCount = 0;
    
    while (this.undoStack.length > targetUndoCount) {
      if (this.undo()) {
        undoneCount++;
      } else {
        break;
      }
    }

    return undoneCount;
  }

  /**
   * Get current size of undo stack
   */
  getUndoStackSize(): number {
    return this.undoStack.length;
  }

  /**
   * Clear undo stack
   */
  clearUndoStack(): void {
    this.undoStack = [];
  }
}
