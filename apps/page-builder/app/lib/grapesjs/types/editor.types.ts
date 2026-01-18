/**
 * Editor Types for GrapeJS AI Integration
 * 
 * Defines the structure for selected components
 * and selection context passed to AI.
 */

/**
 * Component types that can be detected from GrapeJS
 */
export type ComponentType = 
  | 'text'
  | 'heading'
  | 'button'
  | 'image'
  | 'video'
  | 'link'
  | 'section'
  | 'container'
  | 'row'
  | 'column'
  | 'form'
  | 'input'
  | 'wrapper'
  | 'custom';

/**
 * Serialized representation of a selected GrapeJS component
 * This is what gets sent to the AI for context
 */
export interface SelectedComponent {
  /** Unique component ID from GrapeJS */
  id: string;
  
  /** Detected component type */
  type: ComponentType;
  
  /** HTML tag name (button, div, h1, etc.) */
  tagName: string;
  
  /** Text content of the component */
  content: string;
  
  /** Current inline styles */
  styles: Record<string, string>;
  
  /** HTML attributes (class, id, data-*, etc.) */
  attributes: Record<string, string>;
  
  /** CSS class names */
  classes: string[];
  
  /** Parent component ID (null if root) */
  parentId: string | null;
  
  /** Parent component type */
  parentType: ComponentType | null;
  
  /** Number of siblings in parent */
  siblingCount: number;
  
  /** Position index within parent */
  position: number;
  
  /** Child components (limited depth) */
  children?: SelectedComponent[];
  
  /** Whether this component can contain children */
  isContainer: boolean;
}

/**
 * Full context for AI including selected component,
 * page theme, and available resources
 */
export interface SelectionContext {
  /** The currently selected component */
  selectedComponent: SelectedComponent;
  
  /** Detected page theme */
  pageTheme: 'light' | 'dark';
  
  /** Brand colors extracted from page */
  brandColors: string[];
  
  /** Available fonts in the editor */
  availableFonts: string[];
  
  /** Current page ID */
  pageId: string;
  
  /** Current user ID */
  userId: string;
}

/**
 * Result of capturing component state for undo
 */
export interface ComponentState {
  content: string;
  styles: Record<string, string>;
  attributes: Record<string, string>;
  classes: string[];
}

/**
 * Item in the undo stack
 */
export interface UndoItem {
  componentId: string;
  state: ComponentState;
  timestamp: Date;
}
