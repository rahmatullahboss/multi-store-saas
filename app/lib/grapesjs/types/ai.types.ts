/**
 * AI Types for GrapeJS AI Integration
 * 
 * Defines chat message and request structures.
 */

import type { ComponentType } from './editor.types';
import type { AIAction } from './actions.types';

/**
 * Single chat message in the conversation
 */
export interface ChatMessage {
  /** Unique message ID */
  id: string;
  
  /** Who sent the message */
  role: 'user' | 'assistant' | 'system';
  
  /** Message content */
  content: string;
  
  /** When the message was sent */
  timestamp: Date;
  
  /** Context at the time of message (for user messages) */
  context?: {
    selectedElementId: string;
    selectedElementType: ComponentType;
  };
  
  /** Actions that were executed (for assistant messages) */
  actions?: AIAction[];
  
  /** Status of the message/action */
  status: 'pending' | 'success' | 'error' | 'preview';
  
  /** For revert functionality - undo stack count before this message */
  undoCount?: number;
}

/**
 * Request sent to AI backend
 */
export interface AIRequest {
  /** The selected component to modify */
  selectedComponent: import('./editor.types').SelectedComponent;
  
  /** User's command in natural language */
  userCommand: string;
  
  /** Full selection context */
  context: import('./editor.types').SelectionContext;
  
  /** Previous messages for context */
  conversationHistory: ChatMessage[];
}

/**
 * History entry for timeline view
 */
export interface HistoryEntry {
  /** Unique entry ID */
  id: string;
  
  /** When the action happened */
  timestamp: Date;
  
  /** Type of action performed */
  actionType: string;
  
  /** Human-readable description */
  description: string;
  
  /** Undo stack count for reverting to this point */
  undoCount: number;
  
  /** Associated chat message ID */
  messageId: string;
  
  /** Component ID that was modified */
  targetComponentId: string;
  
  /** Component type for icon display */
  targetComponentType: ComponentType;
}
