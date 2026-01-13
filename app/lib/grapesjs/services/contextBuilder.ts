/**
 * Context Builder Service
 * 
 * Serializes GrapeJS components into a clean context object
 * that can be sent to the AI for processing.
 */

import type { 
  SelectedComponent, 
  SelectionContext, 
  ComponentType 
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
      pageId: this.editor.getConfig()?.pageId || 'unknown',
      userId: this.editor.getConfig()?.userId || 'unknown',
    };
  }

  /**
   * Serialize GrapeJS component to clean object
   */
  serializeComponent(component: any): SelectedComponent {
    const styles = component.getStyle() || {};
    const attributes = component.getAttributes() || {};
    const classes = (component.getClasses() || []).map((c: any) => c.id || c);
    const parent = component.parent();
    
    return {
      id: component.getId(),
      type: this.detectComponentType(component),
      tagName: component.get('tagName') || 'div',
      content: component.get('content') || this.getInnerContent(component),
      styles: this.cleanStyles(styles),
      attributes: this.cleanAttributes(attributes),
      classes,
      parentId: parent ? parent.getId() : null,
      parentType: parent ? this.detectComponentType(parent) : null,
      siblingCount: parent ? parent.components().length : 0,
      position: this.getPositionInParent(component),
      isContainer: this.isContainerType(component),
      children: this.serializeChildren(component),
    };
  }

  /**
   * Detect component type from GrapeJS component
   */
  detectComponentType(component: any): ComponentType {
    const type = component.get('type');
    const tagName = (component.get('tagName') || '').toLowerCase();
    
    // Check explicit type first
    if (type === 'text') return 'text';
    if (type === 'textnode') return 'text';
    if (type === 'image') return 'image';
    if (type === 'video') return 'video';
    if (type === 'link') return 'link';
    
    // Check by tagName
    if (tagName === 'button') return 'button';
    if (tagName === 'a') return 'link';
    if (tagName === 'img') return 'image';
    if (tagName === 'video') return 'video';
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) return 'heading';
    if (tagName === 'p' || tagName === 'span') return 'text';
    if (tagName === 'section') return 'section';
    if (tagName === 'form') return 'form';
    if (tagName === 'input' || tagName === 'textarea') return 'input';
    
    // Check by classes
    const classes = (component.getClasses() || []).join(' ').toLowerCase();
    if (classes.includes('section')) return 'section';
    if (classes.includes('container')) return 'container';
    if (classes.includes('row')) return 'row';
    if (classes.includes('col')) return 'column';
    if (classes.includes('btn') || classes.includes('button')) return 'button';
    
    // Default based on children
    if (component.components && component.components().length > 0) return 'container';
    
    return 'wrapper';
  }

  /**
   * Get text content from component and its children
   */
  private getInnerContent(component: any): string {
    const content = component.get('content') || '';
    if (content) return content;
    
    // For components with children, get text nodes
    if (!component.components) return '';
    const children = component.components();
    if (children.length === 0) return '';
    
    return children
      .map((child: any) => child.get('content') || '')
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Clean styles object - remove undefined/null values
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
   * Clean attributes - remove GrapeJS internal attributes
   */
  private cleanAttributes(attrs: Record<string, any>): Record<string, string> {
    const cleaned: Record<string, string> = {};
    const skipPrefixes = ['data-gjs-'];
    
    for (const [key, value] of Object.entries(attrs)) {
      // Keep data-gjs-id for targeting, skip others
      if (key === 'data-gjs-id' || !skipPrefixes.some(p => key.startsWith(p))) {
        if (value !== undefined && value !== null) {
          cleaned[key] = String(value);
        }
      }
    }
    
    return cleaned;
  }

  /**
   * Get position of component within parent
   */
  private getPositionInParent(component: any): number {
    const parent = component.parent();
    if (!parent || !parent.components) return 0;
    
    const siblings = parent.components();
    return siblings.indexOf(component);
  }

  /**
   * Check if component is a container type
   */
  private isContainerType(component: any): boolean {
    const type = this.detectComponentType(component);
    return ['section', 'container', 'row', 'column', 'wrapper'].includes(type);
  }

  /**
   * Serialize children (limited depth to prevent huge payloads)
   */
  private serializeChildren(component: any, depth = 0): SelectedComponent[] | undefined {
    if (depth > 1) return undefined; // Limit depth
    if (!component.components) return undefined;
    
    const children = component.components();
    if (children.length === 0) return undefined;
    
    return children.slice(0, 5).map((child: any) => ({
      ...this.serializeComponent(child),
      children: this.serializeChildren(child, depth + 1),
    }));
  }

  /**
   * Detect current page theme (light/dark)
   */
  private detectTheme(): 'light' | 'dark' {
    try {
      const body = this.editor.Canvas?.getBody();
      if (!body) return 'light';
      
      const bgColor = window.getComputedStyle(body).backgroundColor;
      const match = bgColor.match(/\d+/g);
      if (!match) return 'light';
      
      const [r, g, b] = match.map(Number);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      return luminance < 0.5 ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  /**
   * Extract brand colors from existing elements
   */
  private extractBrandColors(): string[] {
    // Return common brand colors as fallback
    // In production, scan page for common colors
    return ['#006A4E', '#8B5CF6', '#F9A825', '#10B981'];
  }

  /**
   * Get available fonts
   */
  private getAvailableFonts(): string[] {
    return ['Inter', 'Hind Siliguri', 'Noto Sans Bengali', 'Roboto'];
  }
}

/**
 * Create a ContextBuilder instance
 */
export function createContextBuilder(editor: any): ContextBuilder {
  return new ContextBuilder(editor);
}
