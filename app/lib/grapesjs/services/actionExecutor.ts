/**
 * Action Executor Service
 * 
 * Safely applies AI-generated changes to GrapeJS components
 * with undo support.
 */

import type { 
  AIAction, 
  AIResponse, 
  ActionResult, 
  ExecutionResult,
  ComponentState,
  UndoItem 
} from '../types';

export class ActionExecutor {
  private editor: any;
  private undoStack: UndoItem[] = [];
  private maxUndoStackSize = 50;
  
  constructor(editor: any) {
    this.editor = editor;
  }

  /**
   * Execute validated AI response
   */
  async execute(response: AIResponse): Promise<ExecutionResult> {
    const results: ActionResult[] = [];
    const previousStates: UndoItem[] = [];

    for (const action of response.actions) {
      // Get component by ID
      const component = this.getComponent(action.targetId);
      if (!component) {
        results.push({
          action,
          success: false,
          error: `Component not found: ${action.targetId}`,
        });
        continue;
      }

      // Store previous state for undo
      const previousState = this.captureState(component);
      previousStates.push({
        componentId: action.targetId,
        state: previousState,
        timestamp: new Date(),
      });

      try {
        this.executeAction(component, action);
        results.push({
          action,
          success: true,
        });
      } catch (error) {
        results.push({
          action,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Store undo stack if any action succeeded
    if (results.some(r => r.success)) {
      this.undoStack.push(...previousStates);
      // Limit stack size
      if (this.undoStack.length > this.maxUndoStackSize) {
        this.undoStack = this.undoStack.slice(-this.maxUndoStackSize);
      }
    }

    return {
      success: results.every(r => r.success),
      results,
      canUndo: previousStates.length > 0,
    };
  }

  /**
   * Execute single action on component
   */
  private executeAction(component: any, action: AIAction): void {
    switch (action.action) {
      case 'updateContent':
        this.updateContent(component, action.changes.content!);
        break;
        
      case 'updateStyles':
        this.updateStyles(component, action.changes.styles!);
        break;
        
      case 'updateAttributes':
        this.updateAttributes(component, action.changes.attributes!);
        break;
        
      case 'addClass':
        this.addClass(component, action.changes.addClass!);
        break;
        
      case 'removeClass':
        this.removeClass(component, action.changes.removeClass!);
        break;
        
      case 'updateSrc':
        this.updateSrc(component, action.changes.attributes!.src);
        break;
        
      case 'updateHref':
        this.updateHref(component, action.changes.attributes!.href);
        break;

      case 'updateAlt':
        this.updateAlt(component, action.changes.attributes!.alt);
        break;
        
      default:
        throw new Error(`Unknown action: ${action.action}`);
    }

    // Trigger editor update
    this.editor.trigger('component:update', component);
  }

  /**
   * Update text content
   */
  private updateContent(component: any, content: string): void {
    const type = component.get('type');
    
    if (type === 'text' || type === 'textnode') {
      component.set('content', content);
    } else {
      // For other components, try to update first text child
      const children = component.components ? component.components() : [];
      const textChild = children.find(
        (c: any) => c.get('type') === 'textnode' || c.get('type') === 'text'
      );
      
      if (textChild) {
        textChild.set('content', content);
      } else {
        component.set('content', content);
      }
    }
  }

  /**
   * Update styles
   */
  private updateStyles(component: any, styles: Record<string, string>): void {
    const currentStyles = component.getStyle() || {};
    component.setStyle({
      ...currentStyles,
      ...styles,
    });
  }

  /**
   * Update attributes
   */
  private updateAttributes(component: any, attributes: Record<string, string>): void {
    for (const [key, value] of Object.entries(attributes)) {
      // Skip modifying internal GrapeJS attributes
      if (key.startsWith('data-gjs-') && key !== 'data-gjs-id') {
        continue;
      }
      component.addAttributes({ [key]: value });
    }
  }

  /**
   * Add CSS classes
   */
  private addClass(component: any, classes: string[]): void {
    for (const className of classes) {
      component.addClass(className);
    }
  }

  /**
   * Remove CSS classes
   */
  private removeClass(component: any, classes: string[]): void {
    for (const className of classes) {
      component.removeClass(className);
    }
  }

  /**
   * Update image/video source
   */
  private updateSrc(component: any, src: string): void {
    component.addAttributes({ src });
    
    // Also update the trait if it exists
    const srcTrait = component.getTrait?.('src');
    if (srcTrait) {
      srcTrait.set('value', src);
    }
  }

  /**
   * Update link href
   */
  private updateHref(component: any, href: string): void {
    component.addAttributes({ href });
  }

  /**
   * Update alt text
   */
  private updateAlt(component: any, alt: string): void {
    component.addAttributes({ alt });
  }

  /**
   * Get component by ID
   */
  private getComponent(id: string): any {
    const wrapper = this.editor.DomComponents?.getWrapper();
    if (!wrapper) return null;

    // Try to find by ID
    const byId = wrapper.find(`#${id}`)[0];
    if (byId) return byId;
    
    // Try to find by data-gjs-id
    const byGjsId = wrapper.find(`[data-gjs-id="${id}"]`)[0];
    if (byGjsId) return byGjsId;

    // Try direct component lookup
    return this.editor.DomComponents.getById(id);
  }

  /**
   * Capture component state for undo
   */
  private captureState(component: any): ComponentState {
    return {
      content: component.get('content') || '',
      styles: { ...(component.getStyle() || {}) },
      attributes: { ...(component.getAttributes() || {}) },
      classes: (component.getClasses() || []).map((c: any) => c.id || c),
    };
  }

  /**
   * Undo last action
   */
  undo(): boolean {
    const lastUndo = this.undoStack.pop();
    if (!lastUndo) return false;

    const component = this.getComponent(lastUndo.componentId);
    if (!component) return false;

    // Restore content
    component.set('content', lastUndo.state.content);
    
    // Restore styles
    component.setStyle(lastUndo.state.styles);
    
    // Restore attributes
    for (const [key, value] of Object.entries(lastUndo.state.attributes)) {
      component.addAttributes({ [key]: value });
    }

    // Restore classes
    const currentClasses = (component.getClasses() || []).map((c: any) => c.id || c);
    for (const cls of currentClasses) {
      component.removeClass(cls);
    }
    for (const cls of lastUndo.state.classes) {
      component.addClass(cls);
    }

    this.editor.trigger('component:update', component);
    return true;
  }

  /**
   * Undo multiple actions to reach a specific point
   */
  undoToPoint(targetStackSize: number): number {
    let undoneCount = 0;
    while (this.undoStack.length > targetStackSize && this.undo()) {
      undoneCount++;
    }
    return undoneCount;
  }

  /**
   * Get current undo stack size (for tracking revert points)
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

/**
 * Create an ActionExecutor instance
 */
export function createActionExecutor(editor: any): ActionExecutor {
  return new ActionExecutor(editor);
}
