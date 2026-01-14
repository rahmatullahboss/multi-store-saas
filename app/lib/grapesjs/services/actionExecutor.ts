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
   * Uses GrapesJS native UndoManager for proper undo/redo support
   */
  async execute(response: AIResponse): Promise<ExecutionResult> {
    const results: ActionResult[] = [];

    // Start GrapesJS UndoManager transaction - groups all changes as one undo step
    try {
      this.editor.UndoManager?.start();
    } catch (e) {
      console.warn('[ActionExecutor] Could not start UndoManager transaction');
    }

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

      // Capture state before change for custom undo (backup)
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

    // Stop GrapesJS UndoManager transaction - completes the undo group
    try {
      this.editor.UndoManager?.stop();
    } catch (e) {
      console.warn('[ActionExecutor] Could not stop UndoManager transaction');
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
          this.resolveStyleConflicts(component, action.changes.styles);
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
   * Resolve conflicts between new inline styles and existing Tailwind classes
   */
  private resolveStyleConflicts(component: any, newStyles: Record<string, string>) {
    // Get current classes properly from GrapesJS component
    const currentClassesRaw = component.getClasses();
    // GrapesJS returns array of objects or strings depending on version/context
    const currentClasses: string[] = Array.isArray(currentClassesRaw) 
      ? currentClassesRaw.map((c: any) => typeof c === 'string' ? c : c.id || c.name || '').filter(Boolean)
      : [];

    const classesToRemove: string[] = [];

    // 1. Background Color Conflicts
    if (newStyles['background-color'] || newStyles['background']) {
      // Remove bg-{color}-{shade} but keep gradients/opacity if possible
      // Safe bet: remove any 'bg-' that isn't 'bg-gradient'
      classesToRemove.push(...currentClasses.filter(c => 
        (c.startsWith('bg-') && !c.includes('gradient') && !c.includes('opacity')) ||
        c === 'bg-white' || c === 'bg-black' || c === 'bg-transparent'
      ));
    }

    // 2. Text Color Conflicts
    if (newStyles['color']) {
      // Remove text-{color}-{shade}
      // Exclude text-alignment classes (text-center, text-left, etc.) and size (text-xl)
      const alignmentClasses = ['text-left', 'text-center', 'text-right', 'text-justify', 'text-start', 'text-end'];
      const sizeClasses = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'];
      
      classesToRemove.push(...currentClasses.filter(c => 
        c.startsWith('text-') && 
        !alignmentClasses.includes(c) && 
        !sizeClasses.includes(c) &&
        !c.startsWith('text-[') // arbitrary values might be size or color, easier to assume color if valid hex
      ));
    }

    // 3. Font Size Conflicts
    if (newStyles['font-size']) {
      classesToRemove.push(...currentClasses.filter(c => 
        c.startsWith('text-') && 
        ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'].some(s => c.endsWith(s))
      ));
    }

    // 4. Padding Conflicts
    if (newStyles['padding']) {
      classesToRemove.push(...currentClasses.filter(c => c.startsWith('p-') || c.startsWith('px-') || c.startsWith('py-')));
    }
    if (newStyles['padding-left'] || newStyles['padding-right']) {
      classesToRemove.push(...currentClasses.filter(c => c.startsWith('px-') || c.startsWith('p-')));
    }
    if (newStyles['padding-top'] || newStyles['padding-bottom']) {
      classesToRemove.push(...currentClasses.filter(c => c.startsWith('py-') || c.startsWith('p-')));
    }

    // 5. Margin Conflicts
    if (newStyles['margin']) {
      classesToRemove.push(...currentClasses.filter(c => c.startsWith('m-') || c.startsWith('mx-') || c.startsWith('my-')));
    }

    // 6. Border Radius Conflicts
    if (newStyles['border-radius']) {
      classesToRemove.push(...currentClasses.filter(c => c.startsWith('rounded')));
    }

    // 7. Width/Height Conflicts
    if (newStyles['width']) {
      classesToRemove.push(...currentClasses.filter(c => c.startsWith('w-')));
    }
    if (newStyles['height']) {
      classesToRemove.push(...currentClasses.filter(c => c.startsWith('h-')));
    }

    // Apply removal
    if (classesToRemove.length > 0) {
      console.log(`[ActionExecutor] Resolving conflicts. Removing: ${classesToRemove.join(', ')}`);
      classesToRemove.forEach(className => component.removeClass(className));
    }
  }

  /**
   * Get component by ID from editor
   */
  private getComponent(id: string): any {
    // Strategy 1: Direct ID lookup from GrapesJS (Fastest & Best)
    const directComponent = this.editor.DomComponents.getById(id);
    if (directComponent) return directComponent;

    const wrapper = this.editor.DomComponents.getWrapper();
    if (!wrapper) return null;

    // Strategy 2: Find by HTML ID
    const foundById = wrapper.find(`#${id}`);
    if (foundById && foundById.length > 0) return foundById[0];

    // Strategy 3: Find by data-gjs-id attribute
    const foundByData = wrapper.find(`[data-gjs-id="${id}"]`);
    if (foundByData && foundByData.length > 0) return foundByData[0];

    // Strategy 4: Deep recursive search (Slowest but thorough)
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
