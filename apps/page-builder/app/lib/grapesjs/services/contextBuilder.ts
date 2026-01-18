/**
 * Context Builder Service
 * 
 * Serializes GrapeJS components into the format
 * expected by the AI for strict element targeting.
 */

import type { 
  SelectedComponent, 
  SelectionContext, 
  ComponentType, 
  ComponentState 
} from '../types';

export class ContextBuilder {
  private editor: any;

  constructor(editor: any) {
    this.editor = editor;
  }

  /**
   * Build complete context for AI from selected component
   */
  buildContext(selectedComponent: any): SelectionContext {
    const serialized = this.serializeComponent(selectedComponent);

    return {
      selectedComponent: serialized,
      pageTheme: this.detectTheme(),
      brandColors: this.extractBrandColors(),
      availableFonts: this.getAvailableFonts(),
      pageId: this.editor.getConfig?.()?.pageId || '',
      userId: this.editor.getConfig?.()?.userId || '',
    };
  }

  /**
   * Serialize a GrapeJS component into SelectedComponent format
   */
  serializeComponent(component: any): SelectedComponent {
    if (!component) {
      throw new Error('No component provided');
    }

    const styles = component.getStyle?.() || {};
    const attributes = component.getAttributes?.() || {};
    const classes = (component.getClasses?.() || []).map((c: any) => 
      typeof c === 'string' ? c : c.id || c.name || String(c)
    );
    const parent = component.parent?.();

    return {
      id: component.getId?.() || component.cid || 'unknown',
      type: this.detectComponentType(component),
      tagName: component.get?.('tagName') || 'div',
      content: component.get?.('content') || this.getInnerContent(component),
      styles: this.cleanStyles(styles),
      attributes: this.cleanAttributes(attributes),
      classes,
      parentId: parent ? (parent.getId?.() || parent.cid || null) : null,
      parentType: parent ? this.detectComponentType(parent) : null,
      siblingCount: parent ? (parent.components?.()?.length || 0) : 0,
      position: this.getPositionInParent(component),
      isContainer: this.isContainerType(component),
    };
  }

  /**
   * Capture current state for undo
   */
  captureState(component: any): ComponentState {
    return {
      content: component.get?.('content') || '',
      styles: { ...(component.getStyle?.() || {}) },
      attributes: { ...(component.getAttributes?.() || {}) },
      classes: [...(component.getClasses?.()?.map((c: any) => 
        typeof c === 'string' ? c : c.id || c.name || String(c)
      ) || [])],
    };
  }

  /**
   * Detect component type from GrapeJS component
   */
  private detectComponentType(component: any): ComponentType {
    const type = component.get?.('type') || '';
    const tagName = (component.get?.('tagName') || '').toLowerCase();

    // Check GrapeJS type first
    if (type === 'text') return 'text';
    if (type === 'image') return 'image';
    if (type === 'video') return 'video';
    if (type === 'link') return 'link';

    // Check tag name
    if (tagName === 'button') return 'button';
    if (tagName === 'a') return 'link';
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) return 'heading';
    if (tagName === 'p' || tagName === 'span') return 'text';
    if (tagName === 'section') return 'section';
    if (tagName === 'form') return 'form';
    if (tagName === 'input') return 'input';
    if (tagName === 'img') return 'image';

    // Check if container
    const components = component.components?.();
    if (components && components.length > 0) return 'container';

    return 'wrapper';
  }

  /**
   * Get text content of component
   */
  private getInnerContent(component: any): string {
    const content = component.get?.('content');
    if (content) return content;

    // Try to get inner HTML text
    const view = component.view;
    if (view?.el) {
      return view.el.textContent?.trim() || '';
    }

    return '';
  }

  /**
   * Get position of component within parent
   */
  private getPositionInParent(component: any): number {
    const parent = component.parent?.();
    if (!parent) return 0;

    const siblings = parent.components?.();
    if (!siblings) return 0;

    for (let i = 0; i < siblings.length; i++) {
      if (siblings.at(i) === component) return i;
    }

    return 0;
  }

  /**
   * Check if component can contain children
   */
  private isContainerType(component: any): boolean {
    const type = this.detectComponentType(component);
    return ['section', 'container', 'row', 'column', 'wrapper', 'form'].includes(type);
  }

  /**
   * Clean styles object (remove undefined/null values)
   */
  private cleanStyles(styles: Record<string, any>): Record<string, string> {
    const cleaned: Record<string, string> = {};
    for (const [key, value] of Object.entries(styles)) {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = String(value);
      }
    }
    return cleaned;
  }

  /**
   * Clean attributes object (remove internal GrapeJS attributes)
   */
  private cleanAttributes(attrs: Record<string, any>): Record<string, string> {
    const cleaned: Record<string, string> = {};
    const skipKeys = ['id', 'data-gjs-type', 'data-highlightable'];
    
    for (const [key, value] of Object.entries(attrs)) {
      if (!skipKeys.includes(key) && value !== undefined && value !== null) {
        cleaned[key] = String(value);
      }
    }
    return cleaned;
  }

  /**
   * Detect page theme from canvas
   */
  private detectTheme(): 'light' | 'dark' {
    try {
      const body = this.editor.Canvas?.getBody?.();
      if (!body) return 'light';

      const bgColor = window.getComputedStyle(body).backgroundColor;
      if (!bgColor || bgColor === 'transparent') return 'light';

      // Parse RGB and calculate luminance
      const rgb = bgColor.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        const luminance = (0.299 * parseInt(rgb[0]) + 0.587 * parseInt(rgb[1]) + 0.114 * parseInt(rgb[2])) / 255;
        return luminance < 0.5 ? 'dark' : 'light';
      }
    } catch (e) {
      // Ignore errors
    }
    return 'light';
  }

  /**
   * Extract brand colors from page
   */
  private extractBrandColors(): string[] {
    // Default brand colors - can be enhanced to detect from CSS variables
    return ['#059669', '#2563eb', '#8b5cf6'];
  }

  /**
   * Get available fonts
   */
  private getAvailableFonts(): string[] {
    return ['Hind Siliguri', 'Inter', 'Roboto', 'Open Sans', 'Lato'];
  }
}
